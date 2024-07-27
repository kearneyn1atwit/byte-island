const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

router.get('/networks/:searchBy/:searchString', async (req, res) => {
  
  if(!await auth.verifyJWT(req.headers.authorization)) {
    return res.status(401).json({ message: 'Access denied!' });
  } 

  console.log("Network API Starts!");

  //Check all expected input parameters are present
  let searchBy, searchString;
  try {
    searchBy = Number(req.params.searchBy);
    if(searchBy == null) {
        return res.status(400).json({ message: 'Missing id for what to search by!' });
    }
    searchString = req.params.searchString;
    if(!searchString) {
        return res.status(400).json({ message: 'Missing string to search for!' });
      }
  } catch {
    return res.status(400).json({ message: 'Bad Request' });
  }

  //Check input for other requirements
  if ((searchBy < 0 || searchBy > 2) || typeof searchString !== 'string') {
    return res.status(400).json({ message: 'Invalid search criteria!' });
  }

  try {

    if(searchBy === 1) {
        try { 
            await db.SearchTag(searchString, true).then((data) => {
                searchString = data['tagid'];
            });
        } catch(err) {
            return res.status(400).json({ message: 'Not a valid tag to search by!' });
        }
        
    }

    const username = auth.getUsername(req.headers.authorization);

    //Query database by network name (0) or tags (1)  or networks user is in (2) based on searchBy
    const results = await db.SearchNetworks(searchString, searchBy, username);

    if(results.length === 0) {
        return res.status(200).json({ message: 'No networks were found!' })
    }

    return res.status(200).json(results);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/networks', async (req, res) => {

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

  console.log("POST Networks API Starts!");

  //Check all expected input parameters are present
  let name,desc,image,private;
  try {
      name = req.body.networkname;
      if(name == null) {
          return res.status(400).json({ message: 'Missing network name!' });
      }
      desc = req.body.networkdescription;
      if(desc == null) {
          return res.status(400).json({ message: 'Missing network description!' });
      }
      image = req.body.networkpicture;
      if(image == null) {
          return res.status(400).json({ message: 'Missing network image!' });
      }
      private = req.body.private;
      if(private == null) {
          return res.status(400).json({ message: 'Missing network status!' });
      }
  } catch {
      return res.status(400).json({ message: 'Bad Request' });
  }

  //Check input for other requirements
  if (typeof name !== 'string') {
      return res.status(400).json({ message: 'Invalid network name' });
  }
  if (typeof desc !== 'string') {
      return res.status(400).json({ message: 'Invalid network description' });
  }
  if (typeof image !== 'string') {
    return res.status(400).json({ message: 'Invalid network image' });
  }
  if (typeof private !== 'boolean') {
    return res.status(400).json({ message: 'Invalid network status' });
  }

  try {

      const id = await db.GetUserId(username); //get the corresponding user id
      if (id == -1) {
          return res.status(400).json({ message: 'User could not be found!' }); 
      }

      const imageid = await db.CreateImage(image);

      const networkId = await db.CreateNetwork(name,desc,private,imageid) //add images later

      const addUserToNetwork = await db.AddNetworkAdmin(id,networkId);

      return res.status(200).send();

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
})

router.put('/networks', async (req, res) => {
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

  console.log("PUT Networks API Starts!");

  //Check all expected input parameters are present
  let network;
  try {
    network = req.body.network;
    if(!network) {
        return res.status(400).json({ message: 'Missing network!' });
      }
  } catch {
    return res.status(400).json({ message: 'Bad Request' });
  }

  try {

    //Verify user exists and get the id
    const userid = await db.GetUserId(username);
    const networkid = await db.GetNetworkId(network);
    if (userid === -1 || networkid === -1) {
      return res.status(400).json({ message: 'Invalid username or network provided' }); 
    }

    const networkMembers = await db.GetNetworkMembers(networkid);

    if(!networkMembers.includes(userid)) {
        return res.status(400).json({ message: "User is already not part of this network!"} )
    }

    const networkAdmins = await db.GetNetworkAdmins(networkid);

    //Make sure username matches token OR token username is admin in the provided network
    if(auth.getUsername(req.headers.authorization) !== username && !networkAdmins.includes(userid)) {
      return res.status(401).json({ message: "Illegal operation!"} )
    }

    const removeNetwork = await db.RemoveNetworkMember(userid,networkid);

    if(removeNetwork) {
        return res.status(200).send();
    } else {
        return res.status(500).json({ message: "Something went wrong trying to remove user from the network!" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/networks', async (req, res) => {
  
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

  console.log("DELETE Networks API Starts!");

  //Check all expected input parameters are present
  let network;
  try {
    network = req.body.network;
    if(!network) {
        return res.status(400).json({ message: 'Missing network!' });
      }
  } catch {
    return res.status(400).json({ message: 'Bad Request' });
  }

  try {

      //Verify user exists and get the id
      const userid = await db.GetUserId(username);
      const networkid = await db.GetNetworkId(network);
      if (userid === -1 || networkid === -1) {
        return res.status(400).json({ message: 'Invalid username or network provided' }); 
      }

      const networkAdmins = await db.GetNetworkAdmins(networkid);

      //Make sure user is a network admin
      if(!networkAdmins.includes(userid)) {
        return res.status(401).json({ message: "Illegal operation!"} )
      }

      try {
        const networkData = await db.DeleteNetwork(network);
      }
      catch(err) {
          console.log(err);
          return res.status(500).json({ message: 'Error deleting user'});
      }

      return res.status(200).send();

  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
 }
});

module.exports = router;