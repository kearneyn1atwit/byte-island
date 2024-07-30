var neo4j = require('neo4j-driver');
const creds = require('../../data/credentials.json');

const uri = creds.neo4j.uri;
const user = creds.neo4j.username;
const password = creds.neo4j.password;

/**
 * @param {string} query String for the Cypher query
 * @returns {QueryResult} Result array that contains all query result information
 */
async function query(query) {

    console.log("Executing Cypher Query: " + query);

    const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    const session = driver.session();

    var results;

    try {
        results = await session.run(query);
    } catch (error) {
        console.error('Error connecting to Neo4j:', error);
        results = undefined;
    }

    driver.close();
    return results;
}

module.exports = {query};