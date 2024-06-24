//Import Wrapper Classes
const psql = require('./PostgresWrapper');
const neo4j = require('./Neo4jWrapper');
const { Pool, QueryArrayResult } = require('pg');

//Import data (maybe move it to one file)
const sql = require('../../data/sql.json');
const cypher = require('../../data/cypher.json');
const { match } = require('assert');

//remove params in data files later?
/**
 * 
 * @param {string} data Generic parametrized query
 * @param {dict} dict Key-Value pairs of parameter names and desired values
 * @returns {string} Query with all specified parameters filled
 */
function fillSQLParams (data, dict) {
    var query = data.query;
    data.params.split(',').forEach((str) => query = query.replaceAll(':'+str,dict[str]));
    return query;
}
/**
 * 
 * @param {string} data Generic parametrized query
 * @param {dict} dict Key-Value pairs of parameter names and desired values
 * @returns {string} Query with all specified parameters filled
 */
function fillCypherParams (data, dict) {
    var query = data.query;
    data.params.split(',').forEach((str) => query = query.replaceAll('<'+str+'>',dict[str]));
    return query;
}

//Function to prevent bad data, return undefined when data is inaccessible
function ProcessData(data, errorVal) {
    try {
        return data; 
    }
    catch {
        return errorVal ?? undefined;
    }
}

//Functions to log data being received by Postgresql and convert it to usable formats
function ProcessAndLogColumnValues(queryResult, index) {
    const colVals = queryResult.rows.map(row => row[Object.keys(row)[index]]);
    const log = '|' + colVals.map(val => ` ${val} |`).join('');
    console.log(log);
    return colVals;
}
function ProcessAndLogRowValues(queryResult, index) {
    const fields = queryResult.fields.map(field => field.name);
    const values = Object.values(queryResult.rows[index]);
    const dict = {};
    fields.forEach((fieldName, i) => {
        dict[fieldName] = values[i];
    });
    const log = '|' + fields.map((fieldName, i) => ` ${fieldName}: ${values[i]} |`).join('');
    console.log(log);
    return dict;
}
function ProcessAndLogTableValues(queryResult) {
    let columns = [];
    queryResult.fields.forEach((f) => { 
        columns.push(f.name); 
    });

    let data = [columns];
    queryResult.rows.forEach((row) => { 
        let rowData = [];
        Object.values(row).forEach((col) => {
            rowData.push(col);
        }); 
        data.push(rowData);
    });

    console.log("Table Data: \n" + data.map(row => '| ' + row.join(' | ') + ' |').join('\n'));
    return data;
}

//Exported functions will be imported and used in API routes
module.exports = {

    //For Development purposes only
    ResetDatabase: async function () {
        await psql.query(`DO $$ 
            DECLARE 
                r RECORD;
            BEGIN 
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP 
                    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE'; 
                END LOOP;
            END $$;`);

        await neo4j.query("MATCH (n) DETACH DELETE n;");
    },

    //User Functions
    CreateUser: async function (username,email,password,image) {
        
        //Make sure user doesn't already exist
        const oldUserRow = await psql.query(fillSQLParams(sql.users.select, {
            "name": username,
        }));
        if(oldUserRow.rowCount !== 0) { //If user exists then return 
            throw new Error("User already exists!");
        }

        //Create user in Postgres and verify its successfully added to the database
        await psql.query(fillSQLParams(sql.users.create, {
            "username": username,
            "email": email,
            "hash": password,
            "image": image,
        }));
        const newUserRow = await psql.query(fillSQLParams(sql.users.select, {
            "name": username,
        }));
        const userId = ProcessData(newUserRow.rows[0]['userid']);
        if(userId === undefined) {
            throw new Error("Error adding user into SQL database.");
        }
        console.log("New user is created with id: " + userId);

        //Create user island + (CREATE FILE FOR THIS)
        const newIsland = await psql.query(fillSQLParams(sql.island.create, {
            "id": userId,
            "path": "/user"+String(userId) //placeholder
        }));

        if(newIsland.rowCount != 1) {
            throw new Error("Island was not created successfully!");
        }

        //Use UserId returned back by Postgres to create corresponding Cypher node
        const newUserNode = await neo4j.query(fillCypherParams(cypher.create.user, {
            "IDVAR": userId
        })); 
        if(newUserNode === undefined) {
            throw new Error("Error adding user into Cypher database.");
        }

        return userId; 
    },
    GetUserId: async function(username) { 
        const user = await psql.query(fillSQLParams(sql.users.select, {
            "name": username,
        }));
        try {
            return user.rows[0]['userid'];
        } catch(err) {
            return -1;
        }
    }, 
    GetUserIdByEmail: async function(email) { 
        const user = await psql.query(fillSQLParams(sql.users.selectByEmail, {
            "email": email,
        }));
        try {
            return user.rows[0]['userid'];
        } catch(err) {
            return -1;
        }
    }, 
    GetUserEmailUsed: async function(email) {
        const userWithEmail = await psql.query(fillSQLParams(sql.users.verifyEmailUnused, {
            "email": email
        }));
        return userWithEmail.rowCount > 0;
    },
    GetUserCredentials: async function(id) { 
        const userData = await psql.query(fillSQLParams(sql.users.getCredentials, {
            "id": id,
        }));
        return ProcessAndLogRowValues(userData,0);
    },
    GetUserStatus: async function(id) { 
        const userData = await psql.query(fillSQLParams(sql.users.getStatus, {
            "id": id,
        }));
        return ProcessAndLogRowValues(userData,0);
    },
    GetUserPoints: async function(id) { 
        const userData = await psql.query(fillSQLParams(sql.users.getPoints, {
            "id": id,
        }));
        return ProcessAndLogRowValues(userData,0);
    },
    GetUserProfileData: async function(idlist) { 

        //Might need enhancing later?

        if(idlist.length === 1) {
            const profile = await psql.query(fillSQLParams(sql.users.getProfileInformation, {
                "id": idlist,
            }));
            return ProcessAndLogRowValues(profile,0);
        } else {
            const miniProfileList = await psql.query(fillSQLParams(sql.users.getMiniProfile, {
                "id": idlist,
            }));
            return ProcessAndLogTableValues(miniProfileList);
        }
    },
    //search is either user's name or tag id
    SearchUsers: async function(search, byName) {

        let matchingUsers = [];

        if(byName) {

            const exactUserMatch = await psql.query(fillSQLParams(sql.users.select, {
                "name": search
            }));
    
            try {
                const id = ProcessAndLogRowValues(exactUserMatch,0);
                matchingUsers.push({
                    username: search,
                    userid: id['userid']
                });
            } catch(e) {
                console.log("Exact match not found: " + e);
            }
    
            const partialUserMatches = await psql.query(fillSQLParams(sql.users.selectSome, {
                "name": search
            }));
    
            if(partialUserMatches.rowCount != 0) {
                partialUserMatches.rows.forEach((rowData) => {
                    if(rowData['username'] !== search) {
                        console.log("Pushing Partial match: " + rowData['username']);
                        matchingUsers.push({
                            username: rowData['username'],
                            userid: rowData['userid']
                        })
                    }
                })
            }
        } else { //By Tags

            const userIds = await neo4j.query(fillCypherParams(cypher.select.relatedUsers, {
                "IDVAR": search
            }));
            idlist = []
            userIds.records.forEach(record => {
                idlist.push(record.get('u').properties.Id.low);
            });

            for (const id of idlist) {

                const userMiniProfile = await psql.query(fillSQLParams(sql.users.getMiniProfile, {
                    "id": id
                }));

                matchingUsers.push({
                    username: userMiniProfile.rows[0]['username'],
                    userid: id
                })
            }
        }

        return matchingUsers
    },
    UpdateUserCredentials: async function(id, dict) { 
        const currentUserData = await psql.query(fillSQLParams(sql.users.getCredentials, {
            "id": id,
        }));
        
        //Make this more efficient later
        if(dict.hasOwnProperty('username')) {

            if(dict['username'] === currentUserData.rows[0]['username']) {
                console.log("Username is already in use.");
            }

            await psql.query(fillSQLParams(sql.users.updateUsername, {
                "id": id,
                "username": dict['username']
            }));
        }

        if(dict.hasOwnProperty('email')) {

            if(dict['email'] === currentUserData.rows[0]['email']) {
                console.log("Email is already in use.");
            }

            await psql.query(fillSQLParams(sql.users.updateEmail, {
                "id": id,
                "email": dict['email']
            }));
        }
        
        if(dict.hasOwnProperty('password')) {

            if(dict['password'] === currentUserData.rows[0]['password']) {
                console.log("Password is already being used.");
            }

            await psql.query(fillSQLParams(sql.users.updatePassword, {
                "id": id,
                "password": dict['password']
            }));
        }

        const newUserData = await psql.query(fillSQLParams(sql.users.getCredentials, {
            "id": id,
        }));
        return ProcessAndLogRowValues(newUserData,0);
    },    
    UpdateUserData: async function(id, dict) {

        //swap this out later so image can also be grabbed
        const currentUserData = await psql.query(fillSQLParams(sql.users.getStatus, {
            "id": id,
        }));

        const userData = ProcessAndLogRowValues(currentUserData,0);

        //Make this more efficient later
        if(dict.hasOwnProperty('image')) {

            //check image exists and make one if it isn't present

            await psql.query(fillSQLParams(sql.users.updateImage, {
                "id": id,
                "image": dict['image']
            }));
        } else {
            dict['image'] = userData['image'];
        }

        if(dict.hasOwnProperty('private')) {
            await psql.query(fillSQLParams(sql.users.private, {
                "id": id,
                "private": String(dict['private'])
            }));
        } else {
            dict['private'] = currentUserData.rows[0]['privateaccount'];
        }
        
        if(dict.hasOwnProperty('restricted')) {
            await psql.query(fillSQLParams(sql.users.restrict, {
                "id": id,
                "restrict": String(dict['restricted'])
            }));
        } else {
            dict['restricted'] = currentUserData.rows[0]['restricted'];
        }

        return dict;
    },
    GetUserFriendsList: async function(id) {
        const friends = await neo4j.query(fillCypherParams(cypher.select.friendsList, {
            "IDVAR": id
        }));
        idlist = []
        friends.records.forEach(record => {
            console.log("Id of friend is: " + record.get('f').properties.Id.low)
            idlist.push(record.get('f').properties.Id.low);
        });
        return idlist;
    },
    RemoveUserFromFriendsList: async function(userId, formerFriendId) { 
        await neo4j.query(fillCypherParams(cypher.remove.usersFromFriends, {
            "IDVAR1": userId,
            "IDVAR2": formerFriendId
        }));
    },
    DeleteUser: async function(username) { 

        const user = await psql.query(fillSQLParams(sql.users.select, {
            "name": username,
        }));
        const id = ProcessData(user.rows[0]['userid']);
        
        if(id === undefined) { //If user doesn't exist then return 
            throw new Error("User doesn't exist!");
        }

        //Delete user in Postgres and verify its successfully "deleted" to the database
        const deleteCmd = await psql.query(fillSQLParams(sql.users.delete, {
            "id": id
        }));

        const checkForUser = await psql.query(fillSQLParams(sql.users.select, {
            "name": username,
        }));
        
        if(deleteCmd.rowCount !== 1 || checkForUser.rowCount !== 0) {
            throw new Error("Error deleting user in SQL database")
        }
        
        //Use UserId returned back by Postgres to "delete" corresponding Cypher node
        const deletedNode = await neo4j.query(fillCypherParams(cypher.delete.user, {
            "IDVAR": id
        })); 
  
        console.log(fillCypherParams(cypher.delete.user, {
            "IDVAR": id
        }));
        console.log(deletedNode);

        return id; 
    },

    //Network Related Functions 
    CreateNetwork: async function (name, private) { 

        //Make sure network doesn't already exist
        const oldNetworkRow = await psql.query(fillSQLParams(sql.networks.select, {
            "name": name
        }));

        if(oldNetworkRow.rowCount !== 0) { //If network exists then return 
            throw new Error("Network already exists!");
        }

        //Create network in Postgres and verify its successfully added to the database
       const newNetworkRow = await psql.query(fillSQLParams(sql.networks.create, {
            "name": name,
            "private": private
        }));

        const networkId = newNetworkRow[1].rows[0]['networkid'];
        console.log("New network is created with id: " + networkId);
        console.log(newNetworkRow[1].rows[0])

        //Use NetworkId returned back by Postgres to create corresponding Cypher node
        const newNetworkNode = await neo4j.query(fillCypherParams(cypher.create.network, {
            "IDVAR": networkId
        })); 
        if(newNetworkNode === undefined) {
            throw new Error("Error adding user into Cypher database.");
        }

        return networkId;
    },
    GetNetworkId: async function (name) { 
        const network = await psql.query(fillSQLParams(sql.networks.select, {
            "name": name
        }));
        return ProcessData(network.rows[0]['networkid']);
    },
    SetNetworkName: async function (id,name) { 
        await psql.query(fillSQLParams(sql.networks.updateName, {
            "id": id,
            "name": name
        }));
        return id;
    },
    SetNetworkStatus: async function (id,private) { 
        await psql.query(fillSQLParams(sql.networks.private, {
            "id": id,
            "private": private
        }));
        return id;
    },
    GetNetworkMembers: async function (id) { 
        const networkMembers = await neo4j.query(fillCypherParams(cypher.select.usersInNetwork, {
            "IDVAR": id,
        })); 
        idlist = []
        networkMembers.records.forEach(record => {
            idlist.push(record.get('u').properties.Id.low);
        });
        return idlist;
    },
    AddNetworkMember: async function (userid,networkid) { 
        await neo4j.query(fillCypherParams(cypher.add.userToNetwork, {
            "IDVAR1": userid,
            "IDVAR2": networkid
        })); 
    },
    RemoveNetworkMember: async function (userid,networkid) {
        await neo4j.query(fillCypherParams(cypher.remove.userFromNetwork, {
            "IDVAR1": userid,
            "IDVAR2": networkid
        }));  
    },
    GetNetworkAdmins: async function (id) {
        const networkAdmins = await neo4j.query(fillCypherParams(cypher.select.networkAdmins, {
            "IDVAR": id,
        })); 
        idlist = []
        networkAdmins.records.forEach(record => {
            idlist.push(record.get('u').properties.Id.low);
        });
        return idlist;
    },
    AddNetworkAdmin: async function (userid,networkid) {
        await neo4j.query(fillCypherParams(cypher.add.userAsAdmin, {
            "IDVAR1": userid,
            "IDVAR2": networkid
        })); 
    },
    RemoveNetworkAdmin: async function (userid,networkid) {
        await neo4j.query(fillCypherParams(cypher.remove.userFromAdmins, {
            "IDVAR1": userid,
            "IDVAR2": networkid
        })); 
    },
    DeleteNetwork: async function (name) {

        const network = await psql.query(fillSQLParams(sql.networks.select, {
            "name": name
        }));
        const id = ProcessData(network.rows[0]['networkid']);
        
        if(id === undefined) { //If network doesn't exist then return 
            throw new Error("Network doesn't exist!");
        }

        //Delete network in Postgres and verify its successfully "deleted" to the database
        const deleteCmd = await psql.query(fillSQLParams(sql.networks.delete, {
            "id": id
        }));

        const checkForNetwork = await psql.query(fillSQLParams(sql.networks.select, {
            "name": name,
        }));
        
        if(deleteCmd.rowCount !== 1 || checkForNetwork.rowCount !== 0) {
            throw new Error("Error deleting network in SQL database")
        }
        
        //Use NetworkId returned back by Postgres to "delete" corresponding Cypher node
        const deletedNode = await neo4j.query(fillCypherParams(cypher.delete.network, {
            "IDVAR": id
        })); 
  
        console.log(deletedNode);

        return id; 
    },

    //Post Related Functions
    CreatePost: async function(userid,text,imageid,replyid,networkid) { 

        if(userid === undefined || (text === undefined && image === undefined)) {
            throw new Error("Invalid data to create a post!");
        }

        params = { userid: userid }

        if(networkid !== undefined) {
            params['networkid'] = networkid;
        } else {
            params['networkid'] = null;
        }
        if(replyid !== undefined) {
            params['replyid'] = replyid;
        } else {
            params['replyid'] = null;
        }
        if(text !== undefined) { //Fix this later
            params['text'] = text;
        } else {
            params['text'] = null;
        }
        if(imageid !== undefined) {
            params['imageid'] = imageid;
        } else {
            params['imageid'] = null;
        }

        //Create post in Postgres and verify its successfully added to the database
        const newPostRow = await psql.query(fillSQLParams(sql.posts.create, params));

        const postId = newPostRow[1].rows[0]['postid'];
        console.log("New post is created with id: " + postId);
        console.log(newPostRow[1].rows[0])

        //Use PostId returned back by Postgres to create corresponding Cypher node
        const newPostNode = await neo4j.query(fillCypherParams(cypher.create.post, {
            "IDVAR": postId
        })); 
        if(newPostNode === undefined) {
            throw new Error("Error adding post into Cypher database.");
        }

        return postId;
    },
    EditPost: async function(id,newtext,newimageid) {
        if(newtext !== undefined, newtext !== null) {
            await psql.query(fillSQLParams(sql.posts.editText, {
                "id": id,
                "text": newtext
            }));
        }
        if(newimageid !== undefined, newimageid !== null) {
            await psql.query(fillSQLParams(sql.posts.editImage, {
                "id": id,
                "imageid": newimageid
            }));
        }
        return id;
    },
    GetUserPosts: async function(id) { 

        const userPosts = await psql.query(fillSQLParams(sql.posts.getByUser, {
            "id":id
        }));
        return ProcessAndLogTableValues(userPosts);
    },
    GetNetworkPosts: async function(id) { 
        const networkPosts = await psql.query(fillSQLParams(sql.posts.getByNetwork, {
            "id":id
        }));
        return ProcessAndLogTableValues(networkPosts);
    },
    LikePost: async function(postid,userid) {

        //Add like to like count in Postgres
        const likeRow = await psql.query(fillSQLParams(sql.posts.like, {
            "id": postid
        }));

        if(likeRow.rowCount !== 1) {
            throw new Error("Failed to add to counter in SQL database");
        }

        //Use ids to create likes relationship between nodes
        const likeRelationship = await neo4j.query(fillCypherParams(cypher.add.likeToPost, {
            "IDVAR1": userid,
            "IDVAR2": postid
        })); 

        if(likeRelationship === undefined) {
            throw new Error("Error adding post like in Cypher database.");
        }

        return likeRelationship;
    },
    UnlikePost: async function(postid,userid) {

        //Add like to like count in Postgres
        const unlikeRow = await psql.query(fillSQLParams(sql.posts.unlike, {
            "id": postid
        }));

        if(unlikeRow.rowCount !== 1) {
            throw new Error("Failed to remove from counter in SQL database");
        }

        //Use ids to remove likes relationship between nodes
        const newPostNode = await neo4j.query(fillCypherParams(cypher.remove.likeFromPost, {
            "IDVAR1": userid,
            "IDVAR2": postid
        })); 

        if(newPostNode === undefined) {
            throw new Error("Error removing post like in Cypher database.");
        }

        return postid;
    },
    DeletePost: async function(id) {
        
        //Delete post in Postgres and verify its successfully "deleted" to the database
        const deleteCmd = await psql.query(fillSQLParams(sql.posts.delete, {
            "id": id
        }));
        
        if(deleteCmd.rowCount !== 1) {
            throw new Error("Error deleting post in SQL database")
        }
        
        //Use PostId returned back by Postgres to "delete" corresponding Cypher node
        const deletedNode = await neo4j.query(fillCypherParams(cypher.delete.post, {
            "IDVAR": id
        })); 

        return id; 
    },
    
    //Tag Related Functions
    CreateTag: async function(name) {

        //Create tag in Postgres and verify its successfully added to the database
        const newTag = await psql.query(fillSQLParams(sql.tags.create, {
            "name": name
        }));

        const tagId = newTag[1].rows[0]['tagid'];
        console.log("New tag is created with id: " + tagId);

        //Use TagId returned back by Postgres to create corresponding Cypher node
        const newTagNode = await neo4j.query(fillCypherParams(cypher.create.tag, {
            "IDVAR": tagId
        })); 
        if(newTagNode === undefined) {
            throw new Error("Error adding tag into Cypher database.");
        }

        return tagId;
    },
    AddTagToUser: async function(tagid,userid) {
        await neo4j.query(fillCypherParams(cypher.add.tagToUser, {
            "IDVAR1": tagid,
            "IDVAR2": userid
        })); 
    },
    AddTagToNetwork: async function(tagid,networkid) {
        await neo4j.query(fillCypherParams(cypher.add.tagToNetwork, {
            "IDVAR1": tagid,
            "IDVAR2": networkid
        })); 
    },
    AddTagToPost: async function(tagid,postid) {
        await neo4j.query(fillCypherParams(cypher.add.tagToPost, {
            "IDVAR1": tagid,
            "IDVAR2": postid
        })); 
    },
    SearchTag: async function(name, onlyExactMatch) {

        //Create tag in Postgres and verify its successfully added to the database
        const exactTagMatch = await psql.query(fillSQLParams(sql.tags.select, {
            "name": name
        }));

        if(onlyExactMatch) {
            try {
                return ProcessAndLogRowValues(exactTagMatch,0);
            } catch(e) {
                throw new Error("Exact tag does not exist!")
            }
        } 

        const partialTagMatches = await psql.query(fillSQLParams(sql.tags.selectSome, {
            "name": name
        }));

        return ProcessAndLogTableValues(partialTagMatches);
    },
    RemoveTagFromUser: async function(tagid,userid) {
        await neo4j.query(fillCypherParams(cypher.remove.tagFromUser, {
            "IDVAR1": tagid,
            "IDVAR2": userid
        })); 
    },
    RemoveTagFromNetwork: async function(tagid,networkid) {
        await neo4j.query(fillCypherParams(cypher.remove.tagFromNetwork, {
            "IDVAR1": tagid,
            "IDVAR2": networkid
        })); 
    },
    RemoveTagFromPost: async function(tagid,postid) {
        await neo4j.query(fillCypherParams(cypher.remove.tagFromPost, {
            "IDVAR1": tagid,
            "IDVAR2": postid
        })); 
    },
    DeleteTag: async function(id) {

        //Delete tag in Postgres and verify its successfully "deleted" to the database
        const deleteCmd = await psql.query(fillSQLParams(sql.tags.delete, {
            "id": id
        }));

        if(deleteCmd.rowCount !== 1) {
            throw new Error("Error deleting tag in SQL database")
        }
        
        //Use TagId returned back by Postgres to "delete" corresponding Cypher node
        await neo4j.query(fillCypherParams(cypher.delete.tag, {
            "IDVAR": id
        })); 

        return id; 
    },

    //Image Functions
    CreateImage: async function (path) {
        const newImage = await psql.query(fillSQLParams(sql.image.create, {
            "path": path
        }));
        return ProcessData(newImage[1].rows[0]['imageid']);
    },
    GetImage: async function (id) { 

        if(id.length) {
            const images = await psql.query(fillSQLParams(sql.image.selectSome, {
                "idlist": id
            }));
            return ProcessAndLogColumnValues(images,1)
        } else {
            const image = await psql.query(fillSQLParams(sql.image.select, {
                "id": id
            }));
            return [image.rows[0]['imagepath']]
        }
    },
    UpdateImage: async function (id, path) { 
        const image = await psql.query(fillSQLParams(sql.image.update, {
            "id": id,
            "path": path
        }));

        if(image.rowCount !== 1) {
            throw new Error("Did not update image!");
        }
        
        return id;
    },
    DeleteImage: async function (id) { 

        const image = await psql.query(fillSQLParams(sql.image.select, {
            "id": id,
        }));

        const exists = ProcessData(image.rows[0]['imageid']);
        
        if(exists === undefined) { //If image doesn't exist then return 
            throw new Error("Image doesn't exist!");
        }

        //Delete image in postgres
        const deleteCmd = await psql.query(fillSQLParams(sql.image.delete, {
            "id": id
        }));

        //Verify image is deleted
        const checkForImage = await psql.query(fillSQLParams(sql.image.select, {
            "id": id,
        }));

        if(deleteCmd.rowCount !== 1 || checkForImage.rowCount !== 0) {
            throw new Error("Error deleting user in SQL database")
        }

        return id;
    },

    //Resource Functions
    //Change Create Shop to have real values eventually
    CreateShop: async function () {
        await psql.query(`
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (0, 'A', 0, 10, 0, 1);
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (1, 'B', 0, 20, 1, 1);
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (2, 'C', 0, 30, 2, 1);
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (3, 'D', 1, 40, 0, 1);
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (4, 'E', 1, 50, 1, 1);
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (5, 'F', 1, 60, 2, 1);
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (6, 'G', 2, 70, 0, 1);
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (7, 'H', 2, 80, 1, 1);
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (8, 'I', 2, 90, 2, 1);
            INSERT INTO Resources (ResourceId, ResourceName, Category, PointsValue, Shape, ImageId) VALUES (9, 'J', 2, 100, 0, 1);
            `);
    },
    GetShopDetails: async function () { 
        const contents = await psql.query(sql.resources.selectAll.query);
        console.log("Shop Contents Are: ");
        ProcessAndLogTableValues(contents);
        return contents;
    },
    GetResourcesByCategory: async function (category) { 
        const contents = await psql.query(fillSQLParams(sql.resources.selectCategory, {
            "category": category
        }));
        console.log("Resource Ids for Category " + category + " are: ");
        return ProcessAndLogColumnValues(contents, 0);
    },
    GetResourcesByShape: async function (shape) { 
        const contents = await psql.query(fillSQLParams(sql.resources.selectShape, {
            "shape": shape
        }));
        console.log("Resource Ids for Shape " + shape + " are: ");
        return ProcessAndLogColumnValues(contents, 0);
    },
    GetResourceDetails: async function (id) { 
        const item = await psql.query(fillSQLParams(sql.resources.select,  {
            "id": id
        }));
        console.log("Resource is: ");
        return ProcessAndLogRowValues(item, 0);
    },

    //Island Related Functions
    SetIslandPopulation: async function (id,people) { 
        const island = await psql.query(fillSQLParams(sql.island.updatePeople,  {
            "id": id,
            "people": people
        }));
        if(island.rowCount != 1) {
            throw new Error("Error updating population!");
        }
    },
    SetIslandData: async function (id,path) { 
        const island = await psql.query(fillSQLParams(sql.island.updateData,  {
            "id": id,
            "path": path
        }));
        if(island.rowCount != 1) {
            throw new Error("Error updating island data!");
        }
    },
    GetIslandData: async function (id) {
        const island = await psql.query(fillSQLParams(sql.island.select,  {
            "id": id
        }));
        return ProcessAndLogRowValues(island, 0);
    },

    //Request Related Functions
    CreateRequest: async function (senderid, targetid, targetIsUser) { 
        
        //Ensure not made for deleted entities
        //Query for request existing / make it so duplicates can't exist

        if(targetIsUser) {
            const friendRequest = await psql.query(fillSQLParams(sql.requests.requestFriend,  {
                "senderid": senderid,
                "userid": targetid
            }));
            if(friendRequest[0].rowCount != 1) {
                throw new Error("Error requesting friend!");
            }
            return friendRequest[1].rows[0]['requestid']

        } else {
            const networkRequest = await psql.query(fillSQLParams(sql.requests.requestNetwork,  {
                "senderid": senderid,
                "networkid": targetid
            }));
            if(networkRequest[0].rowCount != 1) {
                throw new Error("Error requesting friend!");
            }

            return networkRequest[1].rows[0]['requestid']
        }
    },
    ResolveRequest: async function (id) { 
        //Delete request in postgres
        const resolveCmd = await psql.query(fillSQLParams(sql.requests.resolve, {
            "id": id
        }));

        if(resolveCmd.rowCount !== 1) {
            throw new Error("Error resolving request in SQL database. It may have been previously deleted")
        }

        const requestData = await psql.query(fillSQLParams(sql.requests.select, {
            "id": id
        }));

        if(requestData.rows[0]['targetuserid'] !== undefined) { //Friend Request
            const makeFriends = await neo4j.query(fillCypherParams(cypher.add.usersAsFriends, {
                "IDVAR1": requestData.rows[0]['senderid'],
                "IDVAR2": requestData.rows[0]['targetuserid']
            })); 
            if(makeFriends === undefined || makeFriends.records.length != 1) {
                throw new Error("Error adding users as friends in Cypher database.");
            }
        } else { //Network Join Request
            const joinNetwork = await neo4j.query(fillCypherParams(cypher.add.userToNetwork, {
                "IDVAR1": requestData.rows[0]['senderid'],
                "IDVAR2": requestData.rows[0]['targetnetworkid']
            })); 
            if(joinNetwork === undefined || joinNetwork.records.length != 1) {
                throw new Error("Error adding user into network in Cypher database.");
            }
        }

        return id;
    },
    DeleteRequest: async function (id) { 

        //Delete request in postgres
        const deleteCmd = await psql.query(fillSQLParams(sql.requests.delete, {
            "id": id
        }));

        if(deleteCmd.rowCount !== 1) {
            throw new Error("Error deleting request in SQL database")
        }

        return id;
    },
    GetUserOpenRequests: async function (id, targetIsUser) { 

        if(targetIsUser) {
            const openFriendRequests = await psql.query(fillSQLParams(sql.requests.selectOpenFriendRequests,  {
                "senderid": id,
            }));
            return ProcessAndLogTableValues(openFriendRequests);

        } else {
            const openJoinRequests = await psql.query(fillSQLParams(sql.requests.selectOpenNetworkRequests,  {
                "senderid": id
            }));
            return ProcessAndLogTableValues(openJoinRequests);
        }
    },
    GetUserPendingRequests: async function (id, targetIsUser) { 

        if(targetIsUser) {
            const pendingFriendRequests = await psql.query(fillSQLParams(sql.requests.selectPendingFriendRequests,  {
                "userid": id,
            }));
            return ProcessAndLogTableValues(pendingFriendRequests);

        } else {
            const pendingJoinRequests = await psql.query(fillSQLParams(sql.requests.selectPendingNetworkRequests,  {
                "networkid": id
            }));
            return ProcessAndLogTableValues(pendingJoinRequests);
        }
    },

    //Project Related Functions (NEEDS UPDATES)
    CreateProject: async function (userid, name, desc, social, career, personal, duedate) { 
        const newProj = await psql.query(fillSQLParams(sql.projects.create, {
            "userid": userid,
            "name": name,
            "desc": desc,
            "social": social,
            "career": career,
            "personal": personal,
            "duedate": new Date(duedate).toISOString()
        }));
        return ProcessData(newProj[1].rows[0]['projectid']);
    },
    ModifyProject: async function (id, data) { 
        const project = await psql.query(fillSQLParams(sql.projects.select, {
            "id": id
        }));
        current = ProcessAndLogRowValues(project,0);

        params = {
            "id": id
        }
        if(data.hasOwnProperty('name')) {
            params['name'] = data['name'];
        } else {
            params['name'] = current['projectname'];
        }
        if(data.hasOwnProperty('desc')) {
            params['desc'] = data['desc'];
        }else {
            params['desc'] = current['projectdescription'];
        }
        if(data.hasOwnProperty('social')) {
            params['social'] = parseInt(data['social']);
        } else {
            params['social'] = current['socialpoints'];
        }
        if(data.hasOwnProperty('career')) {
            params['career'] = parseInt(data['career']);
        } else {
            params['career'] = current['careerpoints'];
        }
        if(data.hasOwnProperty('personal')) {
            params['personal'] = parseInt(data['personal']);
        } else {
            params['personal'] = current['personalpoints'];
        }
        
        await psql.query(fillSQLParams(sql.projects.modify, params));

        return id;
    },
    SetProjectAsDone: async function (id, datetime) { 

        const project = await psql.query(fillSQLParams(sql.projects.select, {
            "id": id
        }));
        data = ProcessAndLogRowValues(project,0);

        ontime = datetime < new Date(current['duedate']).getTime();

        const finishCmd = await psql.query(fillSQLParams(sql.projects.finish, {
            "id": id,
            "ontime": ontime
        }));

        if(finishCmd.rowCount != 1) {
            throw new Error("Error marking project as done!");
        }

        if(ontime) {
            const updateUser = await psql.query(fillSQLParams(sql.projects.updatePoints, {
                "id": data['userid'],
                "social": data['socialpoints'],
                "career": career['career'],
                "personal": personal['personal']
            }));
        } else {
            //Add mechanics here later
        }
    },
    DeleteProject: async function (id) { 

        const project = await psql.query(fillSQLParams(sql.projects.select, {
            "id": id,
        }));

        const exists = ProcessData(project.rows[0]['projectid']);
        
        if(exists === undefined) { //If project doesn't exist then return 
            throw new Error("Project doesn't exist!");
        }

        //Delete project in postgres
        const deleteCmd = await psql.query(fillSQLParams(sql.projects.delete, {
            "id": id
        }));

        //Verify project is deleted
        const checkForProject = await psql.query(fillSQLParams(sql.projects.select, {
            "id": id,
        }));

        if(deleteCmd.rowCount !== 1 || checkForProject.rowCount !== 0) {
            throw new Error("Error deleting project in database")
        }

        return id;
    },
    GetProjectDetails: async function (id) { 
        const project = await psql.query(fillSQLParams(sql.projects.select, {
            "id": id
        }));
        return ProcessAndLogRowValues(project,0);
    },
    GetUsersProjects: async function (userid) { 
        const projects = await psql.query(fillSQLParams(sql.projects.selectByUser, {
            "id": userid
        }));
        return ProcessAndLogTableValues(projects);
    },

    //Notification Related Functions
    CreateNotification: async function (id,text) { 
        const newNotif = await psql.query(fillSQLParams(sql.notifications.create, {
            "userid": id,
            "text": text
        }));
        return ProcessData(newNotif[1].rows[0]['notificationid']);
    },
    GetUserNotifications: async function (id) { 
        const userNotifs = await psql.query(fillSQLParams(sql.notifications.selectByUser, {
            "id": id,
        }));
        return ProcessAndLogTableValues(userNotifs);
    },
    MarkNotificationAsRead: async function (id) { 

        const markedNotif = await psql.query(fillSQLParams(sql.notifications.markAsRead, {
            "id": id
        }));
        return id;
    },
    DeleteNotification: async function (id) { 

        const notif = await psql.query(fillSQLParams(sql.notifications.selectByUser, {
            "id": id,
        }));

        const exists = ProcessData(notif.rows[0]['notificationid']);
        
        if(exists === undefined) { //If notif doesn't exist then return 
            throw new Error("Notification doesn't exist!");
        }

        //Delete notif in postgres
        const deleteCmd = await psql.query(fillSQLParams(sql.notifications.delete, {
            "id": id
        }));

        //Verify notif is deleted
        const checkForNotif = await psql.query(fillSQLParams(sql.notifications.selectByUser, {
            "id": id,
        }));

        if(deleteCmd.rowCount !== 1) {
            throw new Error("Error deleting notif in SQL database")
        }

        return id;
    },
 }

 /* Unimplemented Functions are below */

//Network Related Functions
function SearchNetworks() {
    sql.networks.select;
    sql.networks.selectSome;
    cypher.select.relatedNetworks;
} 

//Post Related Functions
function SearchPosts() { 
    cypher.select.relatedPosts;
    sql.posts.SEARCHING; 
}

//INVENTORY SYSTEM!!!!!!!!!!!!!!