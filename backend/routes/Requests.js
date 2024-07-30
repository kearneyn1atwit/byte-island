const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

//API call to get all requests for a given username with a given type and subtype
router.get('/requests/:username/:type/:subtype', async (req, res) => {

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

    console.log("GET Requests API Starts!");

    let type, subtype;
    try {
        type = req.params.type;
      if(!type) {
          return res.status(400).json({ message: 'Missing type (user/network)!' });
        }
        subtype = req.params.subtype;
      if(!subtype) {
          return res.status(400).json({ message: 'Missing type (open/pending)!' });
        }
    } catch {
      return res.status(400).json({ message: 'Bad Request' });
    }

    if(type !== 'user' && type !== 'network') {
        return res.status(400).json({ message: 'Invalid type!' });
    }

    if(subtype !== 'open' && subtype !== 'pending') {
        return res.status(400).json({ message: 'Invalid type!' });
    }

    try {

        const id = await db.GetUserId(username);
        console.log(id);
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        let requests;

        //Finish this later
        if(subtype === 'open') {
            requests = await db.GetUserOpenRequests(id,type === 'user');
        } else { //pending
            requests = await db.GetUserPendingRequests(id,type === 'user')
        }

        console.log(requests);
        requests.shift();

        if(requests.length === 0) {
            return res.status(200).json({ message: "No requests were found!" });
        }

        //Format results and return for both requests and requests2
        let results = [];
        
        for(i = 0; i < requests.length; i++) {

            const rowData = requests[i];
            let msg, acpt;

            if(type === 'user') { 
                if(subtype === 'open') {
                    const user = await db.GetUserCredentials(rowData[1]);
                    msg = "You have a friend request from " + user['username'] + "!";
                    acpt = "You are now friends with " + user['username'] + "!";
                } else {
                    const user = await db.GetUserCredentials(rowData[2]);
                    msg = "Waiting for " + user['username'] + " to respond to your friend request!";
                    acpt = user['username'] + " is now your friend!";
                }
            } else { //Network
                if(subtype === 'open') {
                    const user = await db.GetUserCredentials(rowData[1]);
                    const network = await db.GetNetworkName(rowData[3])
                    msg = user['username'] + " wants to join the " + network + " network!"
                    acpt = user['username'] + " joined the " + network + " network!"
                } else {
                    const network = await db.GetNetworkName(rowData[3])
                    msg = "Waiting for a response to join the " + network + " network!"
                    acpt = "You are now in the " + network + " network!"
                }
            }

            results.push({
                Id: rowData[0],
                Message: msg,
                Datetime: rowData[5],
                AcceptMessage: acpt
            })
        };

        return res.status(200).json(results);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//API call to create a new friend or join request
router.post('/requests', async (req, res) => { 

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

    console.log("POST Requests API Starts!");

    let type,target;
    try {
        type = req.body.type;
        if(type == null) {
            return res.status(400).json({ message: 'Missing requests type!' });
        }
        target = req.body.target;
        if(target == null) {
            return res.status(400).json({ message: 'Missing requests target!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    if(type !== 'user' && type !== 'network') {
        return res.status(400).json({ message: 'Invalid type!' });
    }

    const targetIsUser = type === 'user'

    try {

        const id = await db.GetUserId(username);
        console.log(id);
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        if(targetIsUser) {

            target = await db.GetUserId(target);
            const friends = await db.GetUserFriendsList(id);
            if(friends.includes(target)) {
                return res.status(400).json({ message: "You are already friends with this user!" });
            }

            //Check for duplicates
            const openRequests = await db.GetUserOpenRequests(id,targetIsUser);
            openRequests.shift();
            for(i = 0; i < openRequests.length; i++) {
                if((openRequests[i][2] === id && openRequests[i][1] == target)) {
                    return res.status(400).json({ message: 'Request already exists!' }); 
                }
            }
            const pendingRequests = await db.GetUserPendingRequests(id,targetIsUser);
            pendingRequests.shift();
            for(i = 0; i < pendingRequests.length; i++) {
                if(pendingRequests[i][1] === id && pendingRequests[i][2] == target) {
                    return res.status(400).json({ message: 'Request already exists!' }); 
                }
            }

        } else {
            
            target = await db.GetNetworkId(target);
            const networks = await db.GetUserNetworks(id);
            if(networks.includes(target)) {
                return res.status(400).json({ message: "You are already in this network!" });
            }

            //Check for duplicates
            const openRequests = await db.GetUserOpenRequests(id,targetIsUser);
            openRequests.shift();
            for(i = 0; i < openRequests.length; i++) {
                if((openRequests[i][3] === id && openRequests[i][1] == target)) {
                    return res.status(400).json({ message: 'Request already exists!' }); 
                }
            }
            const pendingRequests = await db.GetUserPendingRequests(id,targetIsUser);
            pendingRequests.shift();
            for(i = 0; i < pendingRequests.length; i++) {
                if(pendingRequests[i][1] === id && pendingRequests[i][3] == target) {
                    return res.status(400).json({ message: 'Request already exists!' }); 
                }
            }
            
        }
        
        //If not duplicates and everything is valid than create the request
        const requestId = await db.CreateRequest(id,target,type === 'user')

        if(requestId === -1) {
            return res.status(500).json({ message: "Error occurred while creating request" })
        }

        if(type === 'user') {
            await db.CreateNotification(target, "You have a pending friend request!");
        } else {
            const admins = await db.GetNetworkAdmins(target);
            for(i = 0; i < admins.length; i++) {
                await db.CreateNotification(admins[i], "You have a pending network join request!");
            }
        }

        return res.status(200).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }

});

//API call to accept a friend or join request
router.put('/requests', async (req, res) => {

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
    let requestid;
    try {
        requestid = req.body.requestid;
        if(requestid == null) {
            return res.status(400).json({ message: 'Missing request id!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    if (typeof requestid !== 'number' || requestid < 0) {
        return res.status(400).json({ message: 'Invalid request id!' });
    }
  
    console.log("PUT Requests API Starts!");

    try {
  
        const id = await db.GetUserId(username); //get the corresponding user id
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const friendRequests = await db.GetUserOpenRequests(id,true);
        friendRequests.shift();
        const joinRequests = await db.GetUserOpenRequests(id,false);
        joinRequests.shift();

        if(friendRequests.length === 0 && joinRequests.length === 0) {
            return res.status(400).json({ message: 'User has no requests to accept!' });
        }

        //Can only if they are the receiver of the friend request or a member of the network
        for(i = 0; i < friendRequests.length; i++) {
            if(friendRequests[i][2] === id) {
                await db.ResolveRequest(requestid);
                await db.CreateNotification(target, "Your friend request for "+username+" was accepted!");
                return res.status(200).send();
            }
         }

         const userNetworks = await db.GetUserNetworks(id); //Change this to admins later

         for(i = 0; i < joinRequests.length; i++) {
            if(userNetworks.includes(joinRequests[i][3])) {
                const network = await db.GetNetworkName(joinRequests[i][3]);
                await db.CreateNotification(target, "Your join request for "+network+" was accepted!");
                await db.ResolveRequest(requestid);
                return res.status(200).send();
            }
         }

        return res.status(400).json({ message: "Invalid request sent!" })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//API call to delete a friend or join request
router.delete('/requests', async (req, res) => {

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
    let requestid;
    try {
        requestid = req.body.requestid;
        if(requestid == null) {
            return res.status(400).json({ message: 'Missing request id!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    if (typeof requestid !== 'number' && (requestid === -1 || requestid > 0)) {
        return res.status(400).json({ message: 'Invalid request id!' });
    }
  
    console.log("DELETE Notifications API Starts!");

    try {
  
        const id = await db.GetUserId(username); //get the corresponding user id
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const openFriendRequests = await db.GetUserOpenRequests(id,true);
        openFriendRequests.shift();
        const openJoinRequests = await db.GetUserOpenRequests(id,false);
        openJoinRequests.shift();
        const pendingFriendRequests = await db.GetUserPendingRequests(id,true);
        pendingFriendRequests.shift();
        const pendingJoinRequests = await db.GetUserPendingRequests(id,false);
        pendingJoinRequests.shift();

        if(openFriendRequests.length === 0 && openJoinRequests.length === 0 && pendingFriendRequests.length === 0 && pendingJoinRequests.length === 0) {
            return res.status(400).json({ message: 'User has no requests to delete!' });
        }

        //Delete only if directly involved with the request
        for(i = 0; i < openFriendRequests.length; i++) {
            if(openFriendRequests[i][0] === requestid) {
                await db.DeleteRequest(requestid);
                return res.status(200).send();
            }
         }

         for(i = 0; i < pendingFriendRequests.length; i++) {
            if(pendingFriendRequests[i][0] === requestid) {
                await db.DeleteRequest(requestid);
                return res.status(200).send();
            }
        }

         for(i = 0; i < openJoinRequests.length; i++) {
            if(openJoinRequests[i][0] === requestid) {
                await db.DeleteRequest(requestid);
                return res.status(200).send();
            }
         }
         for(i = 0; i < pendingJoinRequests.length; i++) {
            if(pendingJoinRequests[i][1] === id) {
                await db.DeleteRequest(requestid);
                return res.status(200).send();
            }
         }

        return res.status(400).json({ message: "Invalid request sent!" })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;