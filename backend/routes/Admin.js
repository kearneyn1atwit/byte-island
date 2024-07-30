const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

router.put('/admin', async (req, res) => {

    let username;

    try {
        username = req.body.username;
    }
    catch(error) {
        
        return res.status(401).json({ message: 'Access denied!' }); 
    }
  
    if(!await auth.verifyJWT(req.headers.authorization, username)) { //Verify token is valid against username
      return res.status(401).json({ message: 'Access denied!' });
    } 

    //Check all expected input parameters are present
    let network, target, add;
    try {
        network = req.body.network;
        if(!network) {
            return res.status(400).json({ message: 'Missing network!' });
        }
        target = req.body.target;
        if(!target) {
            return res.status(400).json({ message: 'Missing target username!' });
        }
        add = req.body.add; 
        if(typeof add !== 'boolean') {
            return res.status(400).json({ message: 'Missing add admin parameter!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }
  
    console.log("PUT Admin API Starts!");

    try {
  
        const userid = await db.GetUserId(username); //get the corresponding user id
        const targetid = await db.GetUserId(target); //get the corresponding user id
        const networkid = await db.GetNetworkId(network); //get the corresponding networkk id
        if (userid === -1 || targetid === -1 || networkid === -1) {
            return res.status(400).json({ message: 'User or network could not be found!' }); 
        }

        //Check userid is an admin
        const networkAdmins = await db.GetNetworkAdmins(networkid);

        if(!networkAdmins.includes(userid)) {
            return res.status(401).json({ message: 'Illegal operation!' }); 
        }

        if(networkAdmins.includes(targetid) === add) { //If these match that means the effect already exists
            return res.status(400).json({ message: 'User already is an admin / not an admin!' }); 
        }

        let notif;
        try {
            if(add) {
                const admin = await db.AddNetworkAdmin(targetid,networkid);
                notif = "You were added as a network admin!";
            } else {
                const unadmin = await db.RemoveNetworkAdmin(targetid,networkid);
                notif = "You were removed as a network admin!";
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error adding/subtracting like to/from post' });
        }

        await db.CreateNotification(targetid, notif);
        return res.status(200).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;