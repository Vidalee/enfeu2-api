# enfeu2-api v1.0.0

API pour https://en-f.eu/

- [API](#api)
	- [Alive?](#alive?)
	- [Domains](#domains)
	
- [User](#user)
	- [Delete](#delete)
	- [Reset API key](#reset-api-key)
	- [Shortener](#shortener)
	- [Query specific files](#query-specific-files)
	- [Update default subdomain](#update-default-subdomain)
	- [updateTags](#updatetags)
	- [Upload](#upload)
	- [Query 20 Files](#query-20-files)
	


# API

## Alive?

<p>Server proof of life.</p>

	GET /


## Domains

<p>List of domains concerned by https://en-f.eu/ .</p>

	GET /domains


# User

## Delete

<p>Used to delete a file from the server.</p>

	POST /delete

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| secret			| String			|  <p>User's API Key</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| file			| Object			|  <p>A file object</p>							|
| file.id			| String			|  <p>The file's ID</p>							|
| file.extension			| String			|  <p>The file's extension i.e : .png .gif</p>							|
| file.author			| String			|  <p>Discord id of the user that uploaded the file</p>							|
| file.size			| Number			|  <p>The file's size</p>							|

## Reset API key

<p>Sets a new API Key for the user.</p>

	POST /resetApiKey

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| secret			| String			|  <p>User's actual API Key</p>							|

## Shortener

<p>Shortens a link.</p>

	POST /shortener

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| secret			| String			|  <p>User's actual API Key</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| link			| String			|  <p>The url to shorten</p>							|

## Query specific files

<p>Get all files with certain name / tags.</p>

	POST /specificFileQuery

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| secret			| String			|  <p>User's actual API Key</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| name			| String			|  <p>Optional : File name to search for</p>							|
| tag			| String			|  <p>Optional : File tag to search for</p>							|

## Update default subdomain

<p>Used user's default subdomain.</p>

	POST /updateDomain

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| secret			| String			|  <p>User's API Key</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| domain			| String			|  <p>Domain as string i.e rlco ifonny kutsa</p>							|

## updateTags

<p>Used to update a file's tags.</p>

	POST /updateTags

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| secret			| String			|  <p>User's API Key</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| file			| Object			|  <p>A file object</p>							|
| file.id			| String			|  <p>The file's ID</p>							|
| file.tags			| Array[String]			|  <p>Array of tags</p>							|

## Upload

<p>Uploads a file.</p>

	POST /upload

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| secret			| String			|  <p>User's actual API Key</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| uploads[]			| FILE			|  <p>The file to send</p>							|

## Query 20 Files

<p>Get 20 files from the db.</p>

	POST /uploadedFiles

### Headers

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| secret			| String			|  <p>User's API Key</p>							|

### Parameters

| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| start			| Number			|  <p>Optional, number of files to skip</p>							|


