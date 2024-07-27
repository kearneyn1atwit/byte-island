const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

router.put('/settings', async (req, res) => {

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

    console.log("PUT Settings API Starts!");

    let setting, value;
    try {
        setting = req.body.setting.toLowerCase(); 
        if(!setting) {
            return res.status(400).json({ message: 'Missing category for what to search by!' });
        }
        value = req.body.value; 
        if(!value) {
            return res.status(400).json({ message: 'Missing category for what to search by!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    validArgs = ['username', 'email', 'password', 'avatar', 'status'] 

    //Check input for other requirements
    if (typeof setting !== 'string' || !validArgs.includes(setting)) {
        return res.status(400).json({ message: 'Invalid setting!' });
    }

    if (typeof value !== 'string') {
        return res.status(400).json({ message: 'Invalid value!' });
    }

    try {

        const id = await db.GetUserId(username);
        console.log(id);
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        if(setting === 'username') { //One option
            await db.UpdateUserCredentials(id, { username: value });
            const token = auth.generateJWT(value);
            return res.status(200).json({ token: token })
        } else if(setting === 'email') {
            //Check input for other requirements
            const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!validEmailRegex.test(value)) {
                return res.status(400).json({ message: 'Email is not a valid format!' });
            }
            await db.UpdateUserCredentials(id, { email: value });
        } else if(setting === 'password') {
            await db.UpdateUserCredentials(id, { password: value });
        } else if(setting === 'avatar') {
            const imageid = await db.CreateImage(value);
            await db.UpdateUserData(id, { image: imageid });
        } else { //setting === status
            if(value.toLowerCase() !== 'public' && value.toLowerCase() !== 'private') {
                return res.status(400).json({ message: "Invalid value!" });
            }
            const bool = value.toLowerCase() === 'private';
            await db.UpdateUserData(id, { private: bool });
        }

        return res.status(200).send(); 

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;