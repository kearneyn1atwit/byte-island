var neo4j = require('neo4j-driver');
const creds = require('../../data/credentials.json');

const uri = creds.neo4j.uri;
const user = creds.neo4j.username;
const password = creds.neo4j.password;

async function query(query) {

    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();

    var results;

    try {

        const result = await session.run(query);
        results = result.records;

        const singleRecord = result.records[0];
        const message = singleRecord.get('message');
        console.log(message); 
    } catch (error) {
        console.error('Error connecting to Neo4j:', error);
    }

      driver.close();

      return results;
}

module.exports = {query};