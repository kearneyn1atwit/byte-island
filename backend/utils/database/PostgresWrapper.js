const { Pool, QueryArrayResult } = require('pg');
const creds = require('../../data/credentials.json');

const host = creds.postgres.host;
const db = creds.postgres.database;
const user = creds.postgres.username;
const password = creds.postgres.password;
const port = creds.postgres.port;

/**
 * @param {string} query 
 * @returns {QueryArrayResult}
 */
async function query(query) {
  
  let results;
  console.log("Executing SQL Query: " + query);

  const pool = new Pool({
    host: host,
    database: db,
    user: user,
    password: password,
    port: port
  });

  try {
    const client = await pool.connect();
    try {
      results = await client.query(query);
    } catch (err) {
      console.error('Error executing query', err.stack);
      results = undefined;
    } finally {
      client.release();
    }
  }  finally {
    await pool.end();
  }

  return results;
}

module.exports = { query };