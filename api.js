const express = require('express');
const router = express();
const dbUtils = require('./db.js');
const formidable = require('formidable');
const path = require('path');
const hat = require('hat');
//const clam = require('clamscan')({ clamdscan: { path: '/usr/share/doc/clamav' }, preference: 'clamscan' });
const fs = require('fs');
const system = require('child_process');
const r = require('rethinkdb');
const bodyParser = require('body-parser');
const multer = require('multer');
const helmet = require('helmet');

router.use(helmet());
router.disable('x-powered-by');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


let db = null;
let domains = ['rlco.en-f.eu', 'crono.en-f.eu', 'equinox.en-f.eu', 'ifonny.en-f.eu', 'kazuto.en-f.eu', 'kutsa.en-f.eu', 'kwodrunk.en-f.eu', 'kyt.en-f.eu', 'neo.en-f.eu', 'poisson.en-f.eu', 'sardoche.en-f.eu', 'vivi.en-f.eu', 'sarakzite.en-f.eu', 'beafantles.en-f.eu', 'darens.en-f.eu', 'sabatard.en-f.eu', 'evo.en-f.eu'];

r.connect({ host: 'localhost', port: 28015 }, (err, connection) => {
    if (err) throw err;
    db = connection;
});


router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, secret');
    next();
});

router.options('/*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, secret');
    res.sendStatus(200);
});

/**
 * @api {get} / Alive?
 * @apiGroup API
 * @apiDescription Server proof of life.
 *
 * @apiSuccess {Number} code      HTTP Status : 200
 * @apiSuccess {String} message   "OK"
 */
router.get('/', (req, res) => {
    res.status(200).json({ message: 'OK' });
});

/**
 * @api {get} /domains Domains
 * @apiGroup API
 * @apiDescription List of domains concerned by https://en-f.eu/ .
 *
 * @apiSuccess {Number}         code      HTTP Status : 200
 * @apiSuccess {String}         message   "OK"
 * @apiSuccess {Array[String]}  domains   Array of domains as strings
 */
router.get('/domains', (req, res) => {
    res.status(200).json({ message: 'OK', domains });
});

/**
 * @api {post} /resetApiKey Reset API key
 * @apiGroup User
 * @apiDescription Sets a new API Key for the user.
 *
 * @apiHeader  {String}  secret    User's actual API Key
 * @apiSuccess {Number}  code      HTTP Status : 200
 * @apiSuccess {String}  message   "OK"
 * @apiSuccess {String}  apiKey    New api key
 *
 * @apiError   {String}  message   "Unauthorized"
 * @apiError   {Number}  code      401
 */
router.post('/resetApiKey', (req, res) => {
    if (req.headers.secret) {
        dbUtils
            .getAll(r, db, 'enfeu', 'users', 'apiKey', req.headers.secret)
            .then((results) => {
                user = results[0];
                user.apiKey = `${hat(16)}${user.id}-${hat(256)}`;
                if (user) {
                    dbUtils
                        .update(r, db, 'enfeu', 'users', user)
                        .then(() => { res.status(200).json({ message: 'OK', apiKey: user.apiKey }); })
                        .catch((err) => {
                            res.status(500).json({ message: 'Interval server error.' });
                            console.error(err);
                        });
                }
            });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});


/**
 * @api {post} /delete Delete
 * @apiGroup User
 * @apiDescription Used to delete a file from the server.
 *
 * @apiHeader  {String}  secret          User's API Key
 * @apiParam   {Object}  file            A file object
 * @apiParam   {String}  file.id         The file's ID
 * @apiParam   {String}  file.extension  The file's extension i.e : .png .gif
 * @apiParam   {String}  file.author     Discord id of the user that uploaded the file
 * @apiParam   {Number}  file.size       The file's size


 * @apiSuccess {Number}  code      HTTP Status : 200
 * @apiSuccess {String}  message   "OK"
 * @apiSuccess {Number}  uploaded  User total uploads size
 *
 *
 * @apiError   {String}  message   "Unauthorized"
 * @apiError   {Number}  code      401
 */
router.post('/delete', (req, res) => {
    if (req.headers.secret && req.body) {
        dbUtils
            .getAll(r, db, 'enfeu', 'users', 'apiKey', req.headers.secret)
            .then((results) => {
                user = results[0];
                if (user) {
                    if (req.body.author && req.body.id && req.body.extension && req.body.size) {
                        if (user.id == req.body.author && typeof(req.body.size) == 'number') {
                            system.exec(`rm -f ./../enfeu2/static/${req.body.id}${req.body.extension}`, (error) => {
                                if (error !== null) {
                                    console.log('exec error: ' + error);
                                } else {
                                    dbUtils
                                        .remove(r, db, 'enfeu', 'uploadedFiles', req.body.id)
                                        .then(() => {
                                            user.uploaded -= req.body.size;
                                            dbUtils.update(r, db, 'enfeu', 'users', user);
                                            res.status(200).json({ message: 'OK', uploaded: user.uploaded });
                                        })
                                        .catch((err) => {
                                            console.error(err);
                                            res.status(500).json({ message: 'Interval server error' });
                                        });
                                }
                            });
                        }
                    } else {
                        res.status(401).json({ message: 'Unauthorized' });
                    }
                }
            });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

/**
 * @api {post} /updateTags updateTags
 * @apiGroup User
 * @apiDescription Used to update a file's tags.
 *
 * @apiHeader  {String}         secret            User's API Key
 * @apiParam   {Object}         file              A file object
 * @apiParam   {String}         file.id           The file's ID
 * @apiParam   {Array[String]}  file.tags         Array of tags


 * @apiSuccess {Number}  code      HTTP Status : 200
 * @apiSuccess {String}  message   "OK"
 *
 *
 * @apiError   {String}  message   "Unauthorized"
 * @apiError   {Number}  code      401
 */
router.post('/updateTags', (req, res) => {
    if (req.headers.secret && req.body) {
        dbUtils
            .getAll(r, db, 'enfeu', 'users', 'apiKey', req.headers.secret)
            .then((results) => {
                user = results[0];
                if (user) {
                    dbUtils
                        .update(r, db, 'enfeu', 'uploadedFiles', req.body)
                        .then(() => { res.status(200).json({ message: 'OK' }); })
                        .catch((err) => {
                            res.status(500).json({ message: 'Interval server error.' });
                            console.error(err);
                        });
                }
            });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});


/**
 * @api {post} /updateDomain Update default subdomain
 * @apiGroup User
 * @apiDescription Used user's default subdomain.
 *
 * @apiHeader  {String}         secret            User's API Key
 * @apiParam   {String}         domain            Domain as string i.e rlco ifonny kutsa


 * @apiSuccess {Number}  code      HTTP Status : 200
 * @apiSuccess {String}  message   "OK"
 *
 *
 * @apiError   {String}  message   "Unauthorized"
 * @apiError   {Number}  code      401
 */
let domainsPrefixes = domains.map((domain) => { return domain.replace('.en-f.eu', ''); });
router.post('/updateDomain', (req, res) => {
    if (req.headers.secret && req.body) {
        dbUtils
            .getAll(r, db, 'enfeu', 'users', 'apiKey', req.headers.secret)
            .then((results) => {
                user = results[0];
                if (user) {
                    if (domainsPrefixes.includes(req.body.domain.toLowerCase())) {
                        user.defaultSubdomain = req.body.domain.toLowerCase();
                        dbUtils
                            .update(r, db, 'enfeu', 'users', user)
                            .then(() => { res.status(200).json({ message: 'OK' }); })
                            .catch(() => { res.status(500).json({ message: 'Internal server error' }); });
                    } else {
                        res.status(401).json({ message: 'Unauthorized' });
                    }
                }
            });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

/**
 * @api {post} /uploadedFiles Query 20 Files
 * @apiGroup User
 * @apiDescription Get 20 files from the db.
 *
 * @apiHeader  {String}         secret            User's API Key
 * @apiParam   {Number}         start             Optional, number of files to skip


 * @apiSuccess {Number}         code      HTTP Status : 200
 * @apiSuccess {String}         message   "OK"
 * @apiSuccess {Array[Object]}  files     Array of files
 *
 *
 * @apiError   {String}  message   "Unauthorized"
 * @apiError   {Number}  code      401
 */
router.post('/uploadedFiles', (req, res) => {
    if (req.headers.secret) {
        dbUtils
            .getAll(r, db, 'enfeu', 'users', 'apiKey', req.headers.secret)
            .then((results) => {
                user = results[0];
                if (user) {
                    r
                        .db('enfeu')
                        .table('uploadedFiles')
                        .orderBy({ index: r.desc('date') })
                        .filter(r.row('author').eq(user.id))
                        .skip((req.body.start ? req.body.start : 0))
                        .limit(20)
                        .run(db)
                        .then((cursor) => cursor.toArray())
                        .then((results) => {
                            res.status(200).json({ message: 'OK', files: results });
                        }).catch((error) => {
                            res.status(500).json({ message: 'Interval server error' });
                            console.error(error);
                        });
                }
            });

    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

/**
 * @api {post} /specificFileQuery Query specific files
 * @apiGroup User
 * @apiDescription Get all files with certain name / tags.
 *
 * @apiHeader  {String}         secret         User's actual API Key
 * @apiParam   {String}         name           Optional : File name to search for
 * @apiParam   {String}         tag            Optional : File tag to search for


 * @apiSuccess {Number}         code      HTTP Status : 200
 * @apiSuccess {String}         message   "OK"
 * @apiSuccess {Array[Object]}  files     Array of files
 *
 *
 * @apiError   {String}  message   "Unauthorized"
 * @apiError   {Number}  code      401
 */
router.post('/specificFileQuery', (req, res) => {
    if (req.headers.secret) {
        dbUtils
            .getAll(r, db, 'enfeu', 'users', 'apiKey', req.headers.secret)
            .then((results) => {
                user = results[0];
                if (user) {
                    if (req.body.name) {
                        dbUtils
                            .getAll(r, db, 'enfeu', 'uploadedFiles', 'originalName', req.body.name)
                            .then((rows) => {
                                let returnedFiles = rows.map((file) => { if (file.author == user.id) { return file; } });
                                res.status(200).json({ message: 'OK', files: returnedFiles });
                            })
                            .catch((err) => {
                                res.status(500).json({ message: 'Interval server error', files: [] });
                                console.error(err);
                            });
                    } else if (req.body.tag) {
                        r
                            .db('enfeu')
                            .table('uploadedFiles')
                            .orderBy({ index: r.desc('date') })
                            .filter(function(row) {
                                return row('tags').contains(req.body.tag).and(row('author').eq(user.id));
                            })
                            .run(db)
                            .then((cursor) => cursor.toArray())
                            .then((results) => {
                                res.status(200).json({ message: 'OK', files: results });
                            }).catch((error) => {
                                res.status(500).json({ message: 'Interval server error' });
                                console.error(error);
                            });
                    } else {
                        r
                            .db('enfeu')
                            .table('uploadedFiles')
                            .orderBy({ index: r.desc('date') })
                            .filter(r.row('author').eq(user.id))
                            .skip((0))
                            .limit(20)
                            .run(db)
                            .then((cursor) => cursor.toArray())
                            .then((results) => {
                                res.status(200).json({ message: 'OK', files: results });
                            }).catch((error) => {
                                res.status(500).json({ message: 'Interval server error' });
                                console.error(error);
                            });
                    }
                }
            });

    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

/**
 * @api {post} /shortener Shortener
 * @apiGroup User
 * @apiDescription Shortens a link.
 *
 * @apiHeader  {String}         secret         User's actual API Key
 * @apiParam   {String}         link           The url to shorten


 * @apiSuccess {Number}         code      HTTP Status : 200
 * @apiSuccess {String}         message   "OK"
 * @apiSuccess {String}         url       Result url
 *
 *
 * @apiError   {String}  message   "Unauthorized"
 * @apiError   {Number}  code      401
 */

let cache = new Map();
// shareX support
let parser = multer();
router.post('/shortener', parser.fields([]), (req, res) => {
    if (req.headers.secret) {
        dbUtils
            .getAll(r, db, 'enfeu', 'users', 'apiKey', req.headers.secret)
            .then((results) => {
                user = results[0];
                if (user) {
                    if (req.body.link) {
                        let url = {
                            author: user.id,
                            id: hat(10),
                            link: req.body.link,
                            date: new Date().getTime()
                        };

                        if (cache.has(url.link)) {
                            res.status(200).json({ message: 'OK', url: `https://${user.defaultSubdomain}.en-f.eu/XD/${cache.get(url.link)}` });
                        } else {
                            cache.set(url.link, url.id);
                            dbUtils
                                .insert(r, db, 'enfeu', 'shortenedUrl', url)
                                .then(() => { res.status(200).json({ message: 'OK', url: `https://${user.defaultSubdomain}.en-f.eu/XD/${url.id}` }); })
                                .catch((err) => {
                                    res.status(500).json({ message: 'Internal server error' });
                                    console.error(err);
                                });
                        }
                    } else {
                        res.status(401).json({ message: 'Unauthorized' });
                    }
                }
            });
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
});

/**
 * @api {post} /upload Upload
 * @apiGroup User
 * @apiDescription Uploads a file.
 *
 * @apiHeader  {String}         secret         User's actual API Key
 * @apiParam   {FILE}           uploads[]      The file to send


 * @apiSuccess {Number}         code      HTTP Status : 200
 * @apiSuccess {String}         message   "OK"
 * @apiSuccess {String}         url       Result url
 *
 *
 * @apiError   {String}  message   "Unauthorized"
 * @apiError   {Number}  code      401
 */
router.post('/upload', (req, res) => {
    let user = null;
    let upload = {};
    let url = '';

    if (req.headers.secret) {
        dbUtils
            .getAll(r, db, 'enfeu', 'users', 'apiKey', req.headers.secret)
            .then((results) => {
                user = results[0];

                if (user) {
                    if (user.uploaded < user.allowed && user.activated) {
                        let form = new formidable.IncomingForm();
                        form.multiples = false;
                        form.uploadDir = path.join(__dirname, '/scanner');

                        form.on('file', (field, file) => {
                            upload.size = file.size;
                            upload.extension = path.extname(file.name);
                            upload.originalName = file.name;
                            upload.id = hat(48);
                            upload.author = user.id;
                            upload.date = new Date().getTime();
                            upload.tags = [];

                            while (fs.existsSync(path.join(__dirname, '../', '/enfeu2', '/static', `/${upload.id}${upload.extension}`))) {
                                upload.id = hat(48);
                            }

                            url = `https://${user.defaultSubdomain}.en-f.eu/${upload.id}${upload.extension}`;
                            fs.rename(file.path, path.join(form.uploadDir, upload.id + upload.extension));
                            upload.preview = url;

                            user.uploaded += upload.size;
                        });

                        form.on('error', (err) => {
                            console.log('Erreur lors de l\'upload :\n');
                            console.error(err);
                            res.status(500).json({ message: 'Interval server error.', code: 500 });
                        });


                        form.on('end', () => {
                            /*clam.is_infected(`./scanner/${upload.id}${upload.extension}`, (err, file, is_infected) => {
                            if (err) { console.error(err); }

                            if (is_infected) {
                            console.log(`Fichier infecté upload par ${user.name}.`);
                            res.status(401).json({ message: 'Unauthorized', url: 'Fichier infecté', code: 401 });

                            system.exec.exec(`rm -f ./scanner/${upload.id}${upload.extension}`, (error) => {
                                console.log(`Suppression du fichier infecté dans : ./scanner/${upload.id}${upload.extension}`);
                                if (error !== null) { console.log('exec error: ' + error); }
                            });

                            } else {*/
                            fs.rename(`./scanner/${upload.id}${upload.extension}`, path.join(__dirname, '../', '/enfeu2', '/static', `/${upload.id}${upload.extension}`));
                            res.status(200).json({ message: 'OK', url, code: 200, uploaded: user.uploaded });

                            dbUtils.update(r, db, 'enfeu', 'users', user);
                            dbUtils.insert(r, db, 'enfeu', 'uploadedFiles', upload);
                            //}
                            //});
                        });

                        form.parse(req);
                    }

                } else {
                    res.status(401).json({ message: 'Unauthorized', code: 401 });
                }
            })
            .catch(console.error);

    } else {
        res.status(401).json({ message: 'Unauthorized', code: 401 });
    }
});

router.listen(7002);
