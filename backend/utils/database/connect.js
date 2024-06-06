const neo4j = require('./Neo4jWrapper');
const psql = require('./PostgresWrapper');
const db = require('./Database.js');
const sql = require('../../data/sql.json');

/*
db.CreateImage("//sss/").then((response) => {
    console.log("New image is created with id: " + response);
});*/

db.CreateUser("zzzz", "vfg@gmail.com", "12345", "1").then((response) => {
    console.log(response);
});

//neo4j.query('RETURN "Hello, Neo4j!" AS message');
//psql.query('SELECT NOW()');
