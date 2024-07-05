const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

router.get('/networks/:searchBy/:searchString', async (req, res) => {

  if(!await auth.verifyJWT(req.headers.authorization)) {
    return res.status(401).json({ message: 'Access denied!' });
  } 

  console.log("Network API Starts!");

  //Check all expected input parameters are present
  let searchBy, searchString;
  try {
    searchBy = Number(req.params.searchBy);
    if(searchBy == null) {
        return res.status(400).json({ message: 'Missing id for what to search by!' });
    }
    searchString = req.params.searchString;
    if(!searchString) {
        return res.status(400).json({ message: 'Missing string to search for!' });
      }
  } catch {
    return res.status(400).json({ message: 'Bad Request' });
  }

  //Check input for other requirements
  if ((searchBy < 0 || searchBy > 2) || typeof searchString !== 'string') {
    return res.status(400).json({ message: 'Invalid search criteria!' });
  }

  try {

    if(searchBy === 1) {
        try { 
            await db.SearchTag(searchString, true).then((data) => {
                searchString = data['tagid'];
            });
        } catch(err) {
            return res.status(400).json({ message: 'Not a valid tag to search by!' });
        }
        
    }

    //Query database by network name (0) or tags (1)  or networks user is in (2) based on searchBy
    const results = await db.SearchNetworks(searchString, searchBy);

    if(results.length === 0) {
        return res.status(200).json({ message: 'No networks were found!' })
    }

    return res.status(200).json(results);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;