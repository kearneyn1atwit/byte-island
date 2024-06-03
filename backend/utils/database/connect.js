const neo4j = require('./Neo4jWrapper');
const psql = require('./PostgresWrapper');

neo4j.query('RETURN "Hello, Neo4j!" AS message');
psql.query('SELECT NOW()');