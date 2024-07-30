const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

//API call to search for user information
router.post('/users', async (req, res) => {

  let username;

    try {
        username = req.body.username;
    }
    catch(error) {
        
        return res.status(401).json({ message: 'Access denied!' }); 
    }

  if(!await auth.verifyJWT(req.headers.authorization)) {
    return res.status(401).json({ message: 'Access denied!' });
  } 

  console.log("User API Starts!");

  //Check all expected input parameters are present
  let searchBy, searchString;
  try {
    searchBy = req.body.searchBy;
    if(searchBy == null) {
        return res.status(400).json({ message: 'Missing id for what to search by!' });
    }
    searchString = req.body.searchString;
    if(!searchString) {
        return res.status(400).json({ message: 'Missing string to search for!' });
      }
  } catch {
    return res.status(400).json({ message: 'Bad Request' });
  }

  //Check input for other requirements
  if ((searchBy < 0 || searchBy > 3) || typeof searchString !== 'string') {
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

    //Query database by username, tags, friends or network members
    let results;
    try {
      results = await db.SearchUsers(searchString, searchBy, username);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ message: 'Invalid search!' });
    }

    if(results.length === 0) {
        return res.status(200).json({ message: 'No users were found!' })
    }

    return res.status(200).json(results);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/users', async (req, res) => {

    let username;

    try {
        username = req.body.username;
    }
    catch(error) {
        return res.status(401).json({ message: 'Access denied!' }); 
    }

    if(!await auth.verifyJWT(req.headers.authorization, username)) { //Verify token is valid and token matches username
        return res.status(401).json({ message: 'Access denied!' });
    } 

    console.log("DELETE Users API Starts!");

    try {

        const userid = await db.GetUserId(username);
        console.log(userid);
        if (userid == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        try {
          const userData = await db.DeleteUser(username);
        }
        catch(err) {
            console.log(err);
            return res.status(500).json({ message: 'Error deleting user'});
        }

        return res.status(200).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
   }
});

module.exports = router;