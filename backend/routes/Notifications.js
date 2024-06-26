const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

router.get('/notifications/:username', async (req, res) => {

    let username;

    try {
        username = req.params.username;
    }
    catch(error) {
        return res.status(401).json({ message: 'Access denied!' }); 
    }

    if(!auth.verifyJWT(req.headers.authorization, username)) { //Verify token is valid and token matches username
        return res.status(401).json({ message: 'Access denied!' });
    } 

    console.log("GET Notifications API Starts!");

    try {

        const id = await db.GetUserId(username);
        console.log(id);
        if (id == -1) {
        return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const notifications = await db.GetUserNotifications(id);

        notifications.shift(); //Remove field names

        if(notifications.length === 0) {
            return res.status(200).json({ message: 'No notifications were found!' })
        }

        //Format results and return
        let results = [];
        notifications.forEach((rowData) => {
            results.push({
                Id: rowData[0],
                Read: rowData[2],
                Message: rowData[1],
                Datetime: rowData[3]
            })
        });

        return res.status(200).json(results);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/notifications', async (req, res) => {

    let username;

    try {
        username = req.body.username;
    }
    catch(error) {
        
        return res.status(401).json({ message: 'Access denied!' }); 
    }
  
    if(!auth.verifyJWT(req.headers.authorization, username)) { //Verify token is valid against username
      return res.status(401).json({ message: 'Access denied!' });
    } 

    //Check all expected input parameters are present
    let notificationId;
    try {
        notificationId = req.body.notificationId;
        if(notificationId == null) {
            return res.status(400).json({ message: 'Missing notification id!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    if (typeof notificationId !== 'number' && (notificationId === -1 || notificationId > 0)) {
        return res.status(400).json({ message: 'Invalid notification id!' });
    }
  
    console.log("PUT Notifications API Starts!");

    try {
  
        const id = await db.GetUserId(username); //get the corresponding user id
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const notifications = await db.GetUserNotifications(id);
        notifications.shift(); //Remove field names

        if(notificationId === -1) { //Mark all
            for (const rowData of notifications) {
                await db.MarkNotificationAsRead(rowData[0]); //Might not need await
            }
            return res.status(200).send();
        } else { //Mark one
            for (const rowData of notifications) {
                if(rowData[0] === notificationId) {
                    await db.MarkNotificationAsRead(notificationId); //Might not need await
                    return res.status(200).send();
                }
            }
            return res.status(400).json({ message: 'Notification id provided was not found with the user!' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/notifications', async (req, res) => {

    let username;

    try {
        username = req.body.username;
    }
    catch(error) {
        
        return res.status(401).json({ message: 'Access denied!' }); 
    }
  
    if(!auth.verifyJWT(req.headers.authorization, username)) { //Verify token is valid against username
      return res.status(401).json({ message: 'Access denied!' });
    } 

    //Check all expected input parameters are present
    let notificationId;
    try {
        notificationId = req.body.notificationId;
        if(notificationId == null) {
            return res.status(400).json({ message: 'Missing notification id!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    if (typeof notificationId !== 'number' && (notificationId === -1 || notificationId > 0)) {
        return res.status(400).json({ message: 'Invalid notification id!' });
    }
  
    console.log("DELETE Notifications API Starts!");

    try {
  
        const id = await db.GetUserId(username); //get the corresponding user id
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const notifications = await db.GetUserNotifications(id);
        notifications.shift(); //Remove field names

        if(notificationId === -1) { //Delete all
            for (const rowData of notifications) {
                await db.DeleteNotification(rowData[0]); //Might not need await
            }
            return res.status(200).send();
        } else { //Delete one
            for (const rowData of notifications) {
                if(rowData[0] === notificationId) {
                    await db.DeleteNotification(notificationId); //Might not need await
                    return res.status(200).send();
                }
            }
            return res.status(400).json({ message: 'Notification id provided was not found with the user!' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;