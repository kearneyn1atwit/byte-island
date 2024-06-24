const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

router.post('/login', async (req, res) => {

  console.log("Login API Starts!");

  //Check all expected input parameters are present
  let email, password;
  try {
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

    //Verify user exists and get the id
    const id = await db.GetUserIdByEmail(email);
    if (id === -1) {
      return res.status(400).json({ message: 'No account associated with provided email' }); 
    }

    //Verify password is correct
    const userData = await db.GetUserCredentials(id);
    if(userData['passwordhash'] !== password) {
      return res.status(400).json({ message: 'Failed to login!' });
    }

    // Generate JWT token and return it 
    const token = auth.generateJWT(userData['username']);

    return res.status(200).json({ 
      token: token,
      username: userData['username']
     });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;