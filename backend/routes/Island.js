const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

//API call to update a user's inventory and island when placing / removing blocks
router.put('/island', async (req, res) => {

    let username;

    try {
        username = req.body.username;
    }
    catch(error) {
        
        return res.status(401).json({ message: 'Access denied!' }); 
    }
  
    if(!await auth.verifyJWT(req.headers.authorization)) { //Verify token is valid against username
      return res.status(401).json({ message: 'Access denied!' });
    } 

    //Check all expected input parameters are present
    let islanddata, blockid, add;
    try {
        islanddata = req.body.islanddata;
        if(!islanddata) {
            return res.status(400).json({ message: 'Missing island data!' });
        }
        blockid = req.body.blockid;
        if(typeof blockid !== 'number') {
            return res.status(400).json({ message: 'Missing block id!' });
        }
        add = req.body.add;
        if(typeof add !== 'boolean') {
            return res.status(400).json({ message: 'Missing block id!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    if (islanddata.length !== 768) {
        return res.status(400).json({ message: 'Invalid island data!' });
    }

    if(blockid < 2 || blockid > 127) {
        return res.status(400).json({ message: 'Invalid block id!' });
    }

    console.log("PUT Island API Starts!");

    try {
  
        const userid = await db.GetUserId(username); //get the corresponding user id
        if (userid == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        //Make sure resource in table
        try {
            await db.GetResourceDetails(blockid);
        }
        catch(err) {
            console.log(err);
            return res.status(400).json({ message: 'Invalid block id!' })
        }

        try {
            await db.SetIslandData(userid,islanddata);
        } catch(err) {
            return res.status(500).json({ message: 'Error trying to update island data!' })
        }

        try {
            const success = await db.SetStock(userid,blockid,1,add);
            const newInventory = await db.GetStock(userid,blockid);
            return res.status(200).json({ success: success, newStock: newInventory }) //Return transaction success & new inventory values
        }
        catch(err) {
            console.log(err);
            return res.status(500).json({ message: 'Error trying to update inventory!' })
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;