const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

//API call to add or remove likes from a post
router.put('/likes', async (req, res) => {

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
    let postid, add;
    try {
        postid = req.body.postid;
        if(postid == null) {
            return res.status(400).json({ message: 'Missing post id!' });
        }
        add = req.body.add; 
        if(typeof add !== 'boolean') {
            return res.status(400).json({ message: 'Missing add like parameter!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    if (typeof postid !== 'number' || postid <= 0) {
        return res.status(400).json({ message: 'Invalid post id!' });
    }
  
    console.log("PUT Likes API Starts!");

    try {
  
        const userid = await db.GetUserId(username); //get the corresponding user id
        if (userid == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const likedPosts = await db.GetUserLikedPosts(userid)

        if(likedPosts.includes(postid) === add) { //If these match that means the effect already exists
            return res.status(400).json({ message: 'User already liked/disliked post!' }); 
        }

        try {
            if(add) {
                const like = await db.LikePost(postid,userid);
            } else {
                const unlike = await db.UnlikePost(postid,userid)
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error adding/subtracting like to/from post' });
        }

        const postData = await db.GetPostDetails(postid);
        await db.CreateNotification(postData['userid'], username + " liked your post!");

        return res.status(200).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;