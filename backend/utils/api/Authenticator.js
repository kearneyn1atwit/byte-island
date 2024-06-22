const jwt = require('jsonwebtoken');
const creds = require('../../data/credentials.json');
const db = require('../database/Database');

/**
 * 
 * @param {string} username User to generate JWT for 
 * @returns Signed token 
 */
function generateJWT(username) {
    const payload = {
        username: username,
        iat: Math.floor(Date.now() / 1000), 
        exp: Math.floor(Date.now() / 1000) + 900 //Lasts 15 minutes
    }
    return jwt.sign(payload, creds.api.secretkey);
}

function verifyJWT(token, username) {
    try {
        //Command will verify token is valid and has not expired yet
        const decoded = jwt.verify(token, creds.api.secretkey);
        console.log('Decoded JWT:', decoded);

        //Validate with SQL that user is present in the database and not deleted
        db.GetUserId(username).then((response) => {

            //Verify username corresponds to a valid user id in the database
            if(typeof response !== 'number' || response <= 0) {
                throw new Error('Username is not valid/present in the database!');
            }

            //Now validate JWT corresponds to the expected user
            if(username !== undefined && decoded['username'] !== username) { 
                throw new Error('Token does not correspond to expected user!')
            }
            
            return true;
        });
    } catch (error) {
        console.error('Error verifying JWT:', error);
        return false; 
    }
}

//const data = verifyJWT(generateJWT('testuser1'), 'testuser1');

module.exports = { generateJWT, verifyJWT };
