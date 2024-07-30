const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

//API call to create a new user with unique credentials and then give back a JWT token
router.post('/signup', async (req, res) => {

  console.log("Signup API Starts!");

  //Check all expected input parameters are present
  let username, email, password;
  try {
    username = req.body.username;
    if(!username) {
        return res.status(400).json({ message: 'Missing username!' });
    }
    email = req.body.email;
    if(!email) {
        return res.status(400).json({ message: 'Missing email!' });
    }
    password = req.body.password;
    if(!password) {
        return res.status(400).json({ message: 'Missing password!' });
      }
  } catch {
    return res.status(400).json({ message: 'Bad Request' });
  }

  //Check input for other requirements
  const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!validEmailRegex.test(email)) {
    return res.status(400).json({ message: 'Email is not a valid format!' });
  }

  try {

    //Check username and email to make sure they aren't already used
    let id = await db.GetUserId(username);
    if (id != -1) {
      return res.status(409).json({ message: 'Username already exists!' }); 
    }
    const emailIsUsed = await db.GetUserEmailUsed(email)
    if(emailIsUsed) {
      return res.status(409).json({ message: 'Email already used!' });
    }

    //Create New User
    try {
        id = await db.CreateUser(username, email, password, 1); //Need a default image in 1's place
        
        if(id < 1) {
            throw new Error('Invalid user id returned!');
        }

    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: "Unknown error occured while creating user!"});
    }

    // Generate JWT token and return it 
    const token = auth.generateJWT(username);
    
    const userData = await db.GetUserProfileData([id]);
    const islandData = await db.GetIslandData(id);

    const imageData = await db.GetImage(userData['profileimageid']);

    return res.status(200).json({ 
      token: token,
      username: userData['username'],
      private: userData['privateaccount'],
      career: userData['careerpoints'],
      personal: userData['personalpoints'],
      social: userData['socialpoints'],
      pfp: imageData,
      island: islandData['datapath']
     });;

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;