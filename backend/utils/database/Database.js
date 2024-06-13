//Import Wrapper Classes
const psql = require('./PostgresWrapper');
const neo4j = require('./Neo4jWrapper');
const { Pool, QueryArrayResult } = require('pg');

//Import data (maybe move it to one file)
const sql = require('../../data/sql.json');
const cypher = require('../../data/cypher.json');

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

        //Create user un Postgres and verify its successfully added to the database
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

        //Use UserId returned back by Postgres to create corresponding Cypher node
        const newUserNode = await neo4j.query(fillCypherParams(cypher.create.user, {
            "IDVAR": userId
        })); 
        if(newUserNode === undefined) {
            throw new Error("Error adding user into Cypher database.");
        }

        return userId; 
    },
    //Don't export and use internally? (Revisit)
    GetUserId: async function(username) { 
        const user = await psql.query(fillSQLParams(sql.users.select, {
            "name": username,
        }));
        return ProcessData(user.rows[0]['userid']);
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

    //Image Functions
    CreateImage: async function (path) {
        const newImage = await psql.query(fillSQLParams(sql.image.create, {
            "path": path
        }));
        return ProcessData(newImage[1].rows[0]['imageid']);
    },
    GetImages: async function (id) { 

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

//User functions
function GetUserProfile() { 
    sql.users.getMiniProfile; 
    sql.users.getProfileInformation; 
    cypher.select.friendsList; //move to separate function???
    //more when add other direction for cypher select queries
}
function GetUserPosts() { sql.posts.getByUser; }
function RemoveUserFromFriendsList() { cypher.remove.usersFromFriends; }
function RemoveUseFromNetwork() { cypher.remove.userFromNetwork; }
function SearchUsers() {//TO BE EXPANDED
    sql.users.select;
    sql.users.selectSome;
    //cypher ???
} 

//Post Related Functions
function CreatePost() { 
    sql.posts.create; 
    cypher.create.post;
}
function ReplyToPost() {
    sql.posts.reply; 
    cypher.create.post;
}
function EditPost() {
    sql.posts.editText;
    sql.posts.editImage;
    cypher.add.tagToPost;
    cypher.remove.tagFromPost;
}
function EditPostLikes() {
    sql.posts.like;
    sql.posts.unlike;
    //ADD CYPHER QUERIES TO THIS
}
function DeletePost() {
    sql.posts.delete;
    cypher.delete.post;
}
function GetUserPosts() { sql.posts.getByUser; }
function GetNetworkPosts() { sql.posts.getByNetwork; }
function SearchPosts() { sql.posts.SEARCHING; }

//Network Related Functions 
function GetNetworkId() { sql.networks.select; }
function CreateNetwork() { 
    sql.networks.create;
    cypher.create.network;
}

function SetNetworkName() { sql.networks.updateName; }
function SetNetworkStatus() { sql.networks.private; }

function GetNetworkMembers() { cypher.select.usersInNetwork; }
function AddNetworkMember() { cypher.add.userToNetwork; }
function RemoveNetworkMember() { cypher.remove.userFromNetwork; }

//Admin Commands (TBD)
function GetNetworkAdmins() {}
function AddNetworkAdmin() {}
function RemoveNetworkAdmin() {}

function SearchNetworks() {} //tbd

function DeleteNetwork() {
    sql.networks.delete;
    cypher.delete.network;
}

//Tag Related Functions

//Island Related Functions
function CreateIsland() { sql.island.create; } //remove export and attach to create user
function SetIslandPopulation() { sql.island.updatePeople; } 
function SetIslandData() { sql.island.updatePeople; }
function GetIslandData() {sql.island.select; }

//Request Related Functions
function CreateRequest() { sql.requests.requestFriend; sql.requests.requestNetwork;}
function ResolveRequest() { sql.requests.resolve; cypher.add.usersAsFriends; cypher.add.userToNetwork;}
function DeleteRequest() { sql.requests.delete; }
function GetUserOpenRequests() { sql.requests.selectOpenFriendRequests; sql.requests.selectOpenNetworkRequests; }
function GetUserPendingRequests() { sql.requests.selectPendingFriendRequests; sql.requests.selectPendingNetworkRequests; }

//Project Related Functions
function CreateProject() { sql.projects.create; }
function ModifyProject() { sql.projects.modify; }
function SetProjectAsDone() { sql.projects.finish; sql.users.updatePoints; }
function DeleteProject() { sql.projects.delete; }

function GetProjectId() { sql.projects.select; }
function GetUsersProjects() { sql.projects.selectByUser; }

//INVENTORY SYSTEM!!!!!!!!!!!!!!