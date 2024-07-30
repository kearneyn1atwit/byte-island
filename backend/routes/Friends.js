const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

//API call to remove a friend from a friends list
router.delete('/friends', async (req, res) => {

    let username1;

    try {
        username1 = req.body.username1;
    }
    catch(error) {
        return res.status(401).json({ message: 'Access denied!' }); 
    }
  
    if(!await auth.verifyJWT(req.headers.authorization, username1)) { //Verify token is valid against username
      return res.status(401).json({ message: 'Access denied!' });
    } 

  console.log("DELETE Friends API Starts!");

  //Check all expected input parameters are present
  let username2;
  try {
    username2 = req.body.username2;
    if(!username2) {
        return res.status(400).json({ message: 'Missing username2!' });
      }
  } catch {
    return res.status(400).json({ message: 'Bad Request' });
  }

  try {

    //Verify user exists and get the id
    const id1 = await db.GetUserId(username1);
    const id2 = await db.GetUserId(username2);
    if (id1 === -1 || id2 === -1) {
      return res.status(400).json({ message: 'Invalid username provided' }); 
    }

    const friendsList = await db.GetUserFriendsList(id1);

    if(!friendsList.includes(id2)) {
        return res.status(400).json({ message: "You are already not friends with this user!"} )
    }

    const removeFriend = await db.RemoveUserFromFriendsList(id1,id2);

    if(removeFriend) {
        await db.CreateNotification(id1, "You are no longer friends with "+username2+"!");
        await db.CreateNotification(id2, "You are no longer friends with "+username1+"!");
        return res.status(200).send();
    } else {
        return res.status(500).json({ message: "Something went wrong trying to remove your former friend!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;