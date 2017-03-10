var pg = require('pg');
var postgresUrl = 'postgres://localhost/twitter';
var client = new pg.Client(postgresUrl);

// connecting to the `postgres` server
client.connect();

// make the client available as a Node module
module.exports = client;
