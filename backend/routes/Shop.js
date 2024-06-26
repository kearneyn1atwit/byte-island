const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

router.get('/shop/:username/:category', async (req, res) => {

    let username;

    try {
        username = req.params.username;
    }
    catch(error) {
        return res.status(401).json({ message: 'Access denied!' }); 
    }

    if(!await auth.verifyJWT(req.headers.authorization, username)) { //Verify token is valid and token matches username
        return res.status(401).json({ message: 'Access denied!' });
    } 

    console.log("GET Shop API Starts!");

    let category;
    try {
        category = req.params.category.toLowerCase(); 
        if(!category) {
            return res.status(400).json({ message: 'Missing category for what to search by!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    validArgs = ['career', 'personal', 'social', 'all'] //alphabetical

    //Check input for other requirements
    if (typeof category !== 'string' || !validArgs.includes(category)) {
        return res.status(400).json({ message: 'Invalid category!' });
    }

    try {

        const id = await db.GetUserId(username);
        console.log(id);
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }
        
        let shop = await db.GetShopDetails();
        console.log(shop)
        shop.shift(); //Remove field names

        if(category !== 'all') {
            let ids = await db.GetResourcesByCategory(validArgs.indexOf(category)); //Convert to number and search

            let temp = [];
            shop.forEach((rowData) => {
                if(ids.includes(rowData[0])) {
                    temp.push(rowData);
                }
            });

            shop = temp;
        }

        if(shop.length <= 0) {
            return res.status(500).json({ message: 'Error loading shop!' })
        }

        console.log(shop);

        //GET USER INVENTORY AND THEN RETURN IT WITH SHOP
        let userData = ['100','100','100','100','100','100','100','100','100','100'];

        //Format results and return
        let results = [];
        shop.forEach((rowData) => {
            results.push({
                Id: rowData[0],
                Name: rowData[1],
                Category: rowData[2],
                Points: rowData[3],
                Shape: rowData[4],
                ImageId: rowData[5],
                Inventory: userData[rowData[0]] //Based on resource id
            })
        });

        return res.status(200).json(results);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/shop', async (req, res) => {

    let username;

    try {
        username = req.body.username;
    }
    catch(error) {
        return res.status(401).json({ message: 'Access denied!' }); 
    }

    if(!auth.verifyJWT(req.headers.authorization, username)) { //Verify token is valid and token matches username
        return res.status(401).json({ message: 'Access denied!' });
    } 

    console.log("PUT Shop API Starts!");

    let resourceid, buying;
    try {
        resourceid = req.body.id; 
        console.log(resourceid)
        if(!resourceid) {
            return res.status(400).json({ message: 'Missing id for what to buy/sell!' });
        }
        buying = req.body.buy; 
        if(typeof buying !== 'boolean') {
            return res.status(400).json({ message: 'Missing buy/sell parameter!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    if (typeof resourceid !== 'number' || resourceid < 0) {
        return res.status(400).json({ message: 'Invalid resource id!' });
    }

    try {
  
        const userid = await db.GetUserId(username);
        console.log(userid);
        if (userid == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }
        
        let resourceData;
        try {
            resourceData = await db.GetResourceDetails(resourceid);
            console.log(resourceData);
        }
        catch(err) {
            console.log(err);
            return res.status(400).json({ message: 'Invalid resource id!' })
        }
        
        const userPoints = await db.GetUserPoints(userid);
        console.log(userPoints)

        //await db.Buy/Sell


        // if(shop.length <= 0) {
        //     return res.status(500).json({ message: 'Error loading shop!' })
        // }

        return res.status(200).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;