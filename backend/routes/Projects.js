const express = require('express');
const router = express.Router();
const db = require('../utils/database/Database');
const auth = require('../utils/api/Authenticator');

//API call to get all projects for a user
router.get('/projects/:username', async (req, res) => {

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

    console.log("GET Projects API Starts!");

    try {

        const id = await db.GetUserId(username);
        console.log(id);
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const projects = await db.GetUsersProjects(id);
        projects.shift();

        if(projects.length === 0) {
            return res.status(200).json({ message: 'No projects were found!' })
        }

        //Format results and return
        let results = [];
        for(i = 0; i < projects.length; i++) {

            //Get Updates for a project if it exists
            const updates = await db.GetProjectUpdates(projects[i][0]);
            updates.shift();

            console.log
            updateArray = [];

            updates.forEach((update) => {
                updateArray.push({
                    Id: update[0],
                    Name: update[1],
                    Date: update[3],
                    Desc: update[2]
                });
            })

            let complete;
            if(projects[i][8] === null) {
                complete = 'incomplete'
            } else {
                complete = new Date().toISOString();
            }

            let expired;
            if(projects[i][8] === false) {
                expired = true;
            } else {
                expired = false;
            }

            results.push({
                Id: projects[i][0], 
                Due: projects[i][10],
                Points: [projects[i][5],projects[i][6],projects[i][4]], //Should be Career/Personal/Social
                Title: projects[i][2], 
                Desc: projects[i][3],
                Completed: complete,
                Expired: expired,
                Updates: updateArray
            })
        };

        return res.status(200).json(results);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//API call to create a new project for a provided user
router.post('/projects', async (req, res) => {

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

    console.log("POST Projects API Starts!");

    //Check all expected input parameters are present
    let due,points,title,desc;
    try {
        due = req.body.due;
        if(due == null) {
            return res.status(400).json({ message: 'Missing due date!' });
        }
        points = req.body.points;
        if(points == null) {
            return res.status(400).json({ message: 'Missing project points!' });
        }
        title = req.body.title;
        if(title == null) {
            return res.status(400).json({ message: 'Missing project title!' });
        }
        desc = req.body.desc;
        if(desc == null) {
            return res.status(400).json({ message: 'Missing project description!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    const datePattern = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)$/;
    if (!datePattern.test(due)) {
        return res.status(400).json({ message: 'Invalid due date!' });
    }
    if (!Array.isArray(points) || points.length !== 3 || !points.every(i => typeof i === 'number') || !points.some(i => i > 0)) {
        return res.status(400).json({ message: 'Invalid point values!' });;
    }
    if (typeof title !== 'string') {
        return res.status(400).json({ message: 'Invalid project title' });
    }
    if (typeof desc !== 'string') {
        return res.status(400).json({ message: 'Invalid project description' });
    }

    try {
  
        const id = await db.GetUserId(username); //get the corresponding user id
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const projects = await db.CreateProject(id,title,desc,points[2],points[0],points[1],due);
        if(projects <= 0) {
            throw new Error('Project id was invalid!');
        }

        return res.status(200).send();

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
})

//API call to add an update to a project
router.put('/projects', async (req, res) => {

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

    console.log("PUT Projects API Starts!");

    let data = {};

    //Check all expected input parameters are present and validate them
    let projectId,markAsDone,due,points,title,desc,updateTitle,updateDesc;
    try {
        //Mandatory Parameters
        projectId = req.body.projectId;
        if(projectId == null) {
            return res.status(400).json({ message: 'Missing project id!' });
        }
        points = req.body.points;
        if(points == null || !Array.isArray(points) || points.length !== 3 || !points.every(i => typeof i === 'number') || !points.some(i => i > 0)) {
            return res.status(400).json({ message: 'Missing/Invalid project points!' });
        }
        data['career'] = points[0];
        data['personal'] = points[1];
        data['social'] = points[2];
        console.log(data);

        updateTitle = req.body.updateTitle;
        if(updateTitle == null) {
            return res.status(400).json({ message: 'Missing update title!' });
        }
        updateDesc = req.body.updateDesc;
        if(updateDesc == null) {
            return res.status(400).json({ message: 'Missing update description!' });
        }

        //Optional Parameters
        markAsDone = req.body.markAsDone;
        if(typeof markAsDone !== 'undefined' && typeof markAsDone !== 'boolean') {
            return res.status(400).json({ message: 'Invalid status update!' });
        }
        due = req.body.due;
        if(typeof due !== 'undefined') {
            const datePattern = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)$/;
            if(!datePattern.test(due)) {
                return res.status(400).json({ message: 'Invalid due date!' });
            } else {
                data['duedate'] = due;
            }
        } 
        title = req.body.title;
        if(typeof title !== 'undefined') {
            if(typeof title !== 'string') {
                return res.status(400).json({ message: 'Invalid new project title!' });
            } else {
                data['name'] = title;
            }
        }
        desc = req.body.desc;
        if(typeof desc !== 'undefined') {
            if(typeof desc !== 'string') {
                return res.status(400).json({ message: 'Invalid new project description!' });
            } else {
                data['desc'] = desc;
            }
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    if (typeof updateTitle !== 'string') {
        return res.status(400).json({ message: 'Invalid update title' });
    }
    if (typeof updateTitle !== 'string') {
        return res.status(400).json({ message: 'Invalid update description' });
    }

    try {
  
        const userid = await db.GetUserId(username); //get the corresponding user id
        if (userid == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        //Get projects with user id
        const projects = await db.GetUsersProjects(userid);
        projects.shift();
        if(projects.length === 0) {
            return res.status(400).json({ message: 'Project to update doesn\'t exist!' });
        }
        
        for(i = 0; i < projects.length; i++) {

            if(projects[i][0] === projectId) { //If project found then update it

                if(markAsDone) {
                    await db.SetProjectAsDone(projectId);
                    return res.status(200).send();
                }
                await db.ModifyProject(projectId, data);
                const updateId = await db.AddProjectUpdate(projectId, updateTitle, updateDesc);
                console.log(updateId)
                return res.status(200).send();
            }

        };

        return res.status(400).json({ message: 'Project to update does not exist!' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

//API call to delete a user's project
router.delete('/projects', async (req, res) => {

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
    let projectId;
    try {
        projectId = req.body.projectId;
        if(projectId == null) {
            return res.status(400).json({ message: 'Missing project id!' });
        }
    } catch {
        return res.status(400).json({ message: 'Bad Request' });
    }

    //Check input for other requirements
    if (typeof projectId !== 'number' || projectId <= 0) {
        return res.status(400).json({ message: 'Invalid project id!' });
    }
  
    console.log("DELETE Projects API Starts!");

    try {
  
        const id = await db.GetUserId(username); //get the corresponding user id
        if (id == -1) {
            return res.status(400).json({ message: 'User could not be found!' }); 
        }

        const projects = await db.GetUsersProjects(id);
        projects.shift(); //Remove field names

        for (const rowData of projects) {
            if(rowData[0] === projectId) {
                await db.DeleteProject(projectId); //Might not need await
                return res.status(200).send();
            }
        }
        return res.status(400).json({ message: 'Project id provided was not found with the user!' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;