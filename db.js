module.exports.getAll = (r, conn, db, table, index, value) => {
    return new Promise((resolve, reject) => {
        r
            .db(db)
            .table(table)
            .getAll(value, { index })
            .run(conn)
            .then((cursor) => cursor.toArray())
            .then((res) => {
                resolve(res);
            })
            .catch((err) => { reject(err); });
    });
};


// Removes a row from a table.
module.exports.remove = (r, conn, db, table, id) => {
    return new Promise((resolve, reject) => {
        r
            .db(db)
            .table(table)
            .get(id)
            .delete()
            .run(conn)
            .then(resolve)
            .catch(reject);
    });
};

// Inserts a row in a table.
module.exports.insert = (r, conn, db, table, object) => {
    return new Promise((resolve, reject) => {
        r
            .db(db)
            .table(table)
            .insert(object)
            .run(conn)
            .then(resolve)
            .catch(reject);
    });
};

// Updates a row in a table.
module.exports.update = (r, conn, db, table, object) => {
    return new Promise((resolve, reject) => {
        r
            .db(db)
            .table(table)
            .get(object.id)
            .update(object)
            .run(conn)
            .then(resolve)
            .catch(reject);
    });
};

// Drops a table.
module.exports.tableDrop = (r, conn, db, table) => {
    return new Promise((resolve, reject) => {
        r
            .db(db)
            .tableDrop(table)
            .run(conn)
            .then(resolve)
            .catch(reject);
    });
};

// Creates a table.
module.exports.tableCreate = (r, conn, db, table) => {
    return new Promise((resolve, reject) => {
        r
            .db(db)
            .tableCreate(table)
            .run(conn)
            .then(resolve)
            .catch(reject);
    });
};


// Gets a row in a table.
module.exports.get = (r, conn, db, table, id) => {
    return new Promise((resolve, reject) => {
        r
            .db(db)
            .table(table)
            .get(id)
            .run(conn)
            .then(resolve)
            .catch(reject);
    });
};