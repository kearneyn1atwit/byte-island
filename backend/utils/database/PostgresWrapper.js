const { Pool } = require('pg');
const creds = require('../../data/credentials.json');

const host = creds.postgres.host;
const db = creds.postgres.database;
const user = creds.postgres.username;
const password = creds.postgres.password;
const port = creds.postgres.port;

async function query(query) {
  
  const pool = new Pool({
    host: host,
    database: db,
    user: user,
    password: password,
    port: port
  });

  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack);
    }
    client.query(query, (err, result) => {
      release();
      if (err) {
        return console.error('Error executing query', err.stack);
      }
      console.log(result.rows);
    });
  });
}

module.exports = { query };