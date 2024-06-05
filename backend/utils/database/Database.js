//Import Wrapper Classes
const psql = require('./PostgresWrapper');
const neo4j = require('./Neo4jWrapper');
const { Pool, QueryArrayResult } = require('pg');

//Import data (maybe move it to one file)
const sql = require('../../data/sql.json');
const cypher = require('../../data/cypher.json');

function fillSQLParams (data, dict) {
    var query = data.query;
    data.params.split(',').forEach((str) => query = query.replaceAll(':'+str,dict[str]));
    return query;
}
function fillCypherParams (data, dict) {
    var query = data.query;
    data.params.split(',').forEach((str) => query = query.replaceAll('<'+str+'>',dict[str]));
    return query;
}

function processResults(data, errorVal) {
    try {
        return data; //grab the select instead of the insert
    }
    catch {
        return errorVal ?? undefined;
    }
}

//Functions in here will be imported by folders in routes to be then used in API calls
//Workflow is as follows [index.js -> routes -> Database (uses Postgres/Neo4jWrappers & data folder] 
module.exports = {

    CreateUser: async function (username,email,password,image) {
        const oldUserRow = await psql.query(fillSQLParams(sql.users.select, {
            "name": username,
        }));
        if(oldUserRow.rowCount !== 0) { //If user exists then return 
            throw new Error("User already exists");
        }
        const newUserInsert = await psql.query(fillSQLParams(sql.users.create, {
            "username": username,
            "email": email,
            "hash": password,
            "image": image,
        }));
        if(newUserInsert === undefined) {
            throw new Error("Error adding user into SQL database.");
        }
        const newUserRow = await psql.query(fillSQLParams(sql.users.select, {
            "name": username,
        }));
        const userId = newUserRow.rows[0]['userid'];
        console.log("New user is created with id: " + userId);
        const newUserNode = await neo4j.query(fillCypherParams(cypher.create.user, {
            "IDVAR": userId
        })); 
        if(newUserInsert === undefined) {
            throw new Error("Error adding user into Cypher database.");
        }
        return userId; 
    },


    //Image Functions
    CreateImage: async function (path) {
        const newImage = await psql.query(fillSQLParams(sql.image.create, {
            "path": path
        }));
        return processResults(newImage[1].rows[0]['imageid']);
    }
 }

//User functions

function GetUserId() { sql.users.select; } //Don't export and use internally?
function GetUserCredentials() { sql.users.getCredentials; }
function GetUserStatus() { sql.users.getStatus; }
function GetUserPoints() { sql.user.getCredentials; }
function GetUserProfile() { 
    sql.users.getMiniProfile; 
    sql.users.getProfileInformation; 
    cypher.select.friendsList; //move to separate function???
    //more when add other direction for cypher select queries
}
function GetUserPosts() { sql.posts.getByUser; }

//Group these together?
function SetUserCredentials() { 
    sql.users.updateUsername; 
    sql.users.updateEmail;
    sql.users.updatePassword;
}

function SetUserData() {
    sql.users.updateImage;
    sql.users.updatePoints;
    sql.users.restrict;
    sql.users.private;
}

function SearchUsers() {//TO BE EXPANDED
    sql.users.select;
    sql.users.selectSome;
    //cypher ???
} 

function DeleteUser() { sql.users.delete; }

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

//Resource Related Functions

function GetShopDetails() { sql.resources.selectAll.query }
function GetResourcesByCategory() { sql.resources.selectCategory }
function GetResourcesByShape() { sql.resources.selectShape.query }
function GetResourceDetails() { sql.resources.select.query }

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

//Image Related Functions
function CreateImage() { sql.image.create; }
function UpdateImage() { sql.image.update; }
function DeleteImage() { sql.image.delete; }
function GetImage() { sql.image.select; sql.image.selectSome; }

//Island Related Functions
function CreateIsland() { sql.island.create; } //remove export and attach to create user
function SetIslandPopulation() { sql.island.updatePeople; } 
function SetIslandData() { sql.island.updatePeople; }
function GetIslandData() {sql.island.select; }

//Request Related Functions

//Project Related Functions
function CreateProject() { sql.projects.create; }
function ModifyProject() { sql.projects.modify; }
function SetProjectAsDone() { sql.projects.finish; }
function DeleteProject() { sql.projects.delete; }

function GetProjectId() { sql.projects.select; }
function GetUsersProjects() { sql.projects.selectByUser; }