const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');


router.get('/posts/:username/:category', async (req, res) => {

    let username;

    try {
        username = req.params.username;
    }
    catch(error) {
        return res.status(401).json({ message: 'Access denied!' }); 
    }

    if(!await auth.verifyJWT(req.headers.authorization)) { //Verify token is valid and token matches username
        return res.status(401).json({ message: 'Access denied!' });
    } 

    const currUser = auth.getUsername(req.headers.authorization);

    console.log("GET Posts API Starts!");

    let category;
    try {
        category = req.params.category.toLowerCase(); 
        if(!category) {
            return res.status(400).json({ message: 'Missing category for what to search by!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    validArgs = ['all', 'friends', 'public'] //alphabetical

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
        
        let posts = await db.GetUserPosts(id);
        console.log(posts)
        posts.shift(); //Remove field names

        if(posts.length === 0) {
            return res.status(200).json({ message: 'User has no posts to load!' })
        }

        //Filter out to only public or private posts as needed
        if(category !== 'all') {

            let temp = [];
            let statusCriteria = (category === 'friends'); //Will be true for private and false for public

            posts.forEach((rowData) => { 
                if(rowData[11] === statusCriteria) {
                    temp.push(rowData);
                }
            })

            posts = temp;

            if(posts.length === 0) {
                return res.status(200).json({ message: 'User has no ' + category + ' posts to load!' })
            }
        }

        const myId = await db.GetUserId(currUser);
        const likedPosts = await db.GetUserLikedPosts(myId);

        // Format results and return
        let results = [];

        for (const rowData of posts) {

            let replyData = await db.GetReplies(rowData[0]);
            replyData.shift();

            let replies = [];

            for (const reply of replyData) {

                const user = await db.GetUserCredentials(reply[1],true);

                //Add images later
                replies.push({
                    Id: reply[0],
                    Datetime: reply[7],
                    User: user['username'],
                    Text: reply[3],
                    Likes: reply[5],
                    LikedReply: likedPosts.includes(reply[0]),
                });
            }

            results.push({
                Id: rowData[0],
                HideReplies: false,
                Datetime: rowData[7],
                User: username,
                Text: rowData[3],
                Image: "FAKE_IMAGE_TEXT", // update this later
                Likes: rowData[5],
                LikedPost: likedPosts.includes(rowData[0]),
                Replies: replies
            });
        }

        return res.status(200).json(results);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/posts', async (req, res) => {

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

    console.log("POST Posts API Starts!");

    //Add images later
    let type, text;
    try {
        type = req.body.type; 
        if(!type) {
            return res.status(400).json({ message: 'Missing type of post!' });
        }
        text = req.body.text; 
        if(!text) {
            return res.status(400).json({ message: 'Missing text for post!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    if (typeof type !== 'string' || (type !== 'friends' && type !== 'public')) {
        return res.status(400).json({ message: 'Invalid type of post!' });
    }

    try {
  
        const userid = await db.GetUserId(username);
        console.log(userid);
        if (userid == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }
        
        try {
            const post = await db.CreatePost(userid, text, null, null, null, type === 'friends');
        }
        catch(err) {
            console.log(err);
            return res.status(500).json({ message: 'Error creating post!'});
        }

        return res.status(200).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/posts', async (req, res) => {

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

    console.log("PUT Posts API Starts!");

    //Add images later
    let text, postid;
    try {
        text = req.body.text; 
        if(!text) {
            return res.status(400).json({ message: 'Missing text for post!' });
        }
        postid = req.body.postid; 
        if(!postid) {
            return res.status(400).json({ message: 'Missing postid for post!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    if (typeof postid !== 'number' || postid <= 0) {
        return res.status(400).json({ message: 'Invalid post id!' });
    }

    if (typeof text !== 'string') {
        return res.status(400).json({ message: 'Invalid post text!' });
    }

    try {
  
        const userid = await db.GetUserId(username);
        console.log(userid);
        if (userid == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const postData = await db.GetPostDetails(postid);
        console.log(postData);
        if (postData === undefined) {
            return res.status(400).json({ message: 'Invalid post id!' }); 
        }
        
        try {
            const post = await db.CreatePost(userid, text, null, postid, null, null);
        }
        catch(err) {
            console.log(err);
            return res.status(500).json({ message: 'Error creating reply!'});
        }

        return res.status(200).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/posts', async (req, res) => { 

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

    console.log("DELETE Posts API Starts!");

    let postid;
    try {
        postid = req.body.postid; 
        if(!postid) {
            return res.status(400).json({ message: 'Missing postid for post!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    if (typeof postid !== 'number' || postid <= 0) {
        return res.status(400).json({ message: 'Invalid post id!' });
    }

    try {
  
        const userid = await db.GetUserId(username);
        console.log(userid);
        if (userid == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const postData = await db.GetPostDetails(postid);
        console.log(postData);
        if (postData === undefined) {
            return res.status(400).json({ message: 'Invalid post id!' }); 
        }

        if(postData['userid'] !== userid) {
            return res.status(400).json({ message: 'Invalid post id!' }); 
        }
        
        try {
            const post = await db.DeletePost(postid);
        }
        catch(err) {
            console.log(err);
            return res.status(500).json({ message: 'Error deleting post!'});
        }

        return res.status(200).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;