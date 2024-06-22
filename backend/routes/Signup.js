const express = require('express');
const router = express.Router();
//const bcrypt = require('bcrypt');
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

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
    const id = await db.GetUserId(username);
    if (id != -1) {
      return res.status(409).json({ message: 'Username already exists!' }); //needs email check
    }
    const emailIsUsed = await db.GetUserEmailUsed(email)
    if(emailIsUsed) {
      return res.status(409).json({ message: 'Email already used!' });
    }

    //Create New User
    try {
        const id = await db.CreateUser(username, email, password, 1); //Need a default image in 1's place
        
        if(id < 1) {
            throw new Error('Invalid user id returned!');
        }

    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: "Unknown error occured while creating user!"});
    }

    // Generate JWT token and return it 
    const token = auth.generateJWT(username);

    return res.status(200).json({ 
      token: token,
      username: username
     });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;