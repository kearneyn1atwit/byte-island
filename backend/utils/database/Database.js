//Import Wrapper Classes
const psql = require('./PostgresWrapper');
const neo4j = require('./Neo4jWrapper');

//Import data (maybe move it to one file)
const sql = require('../../data/sql.json');
const cypher = require('../../data/cypher.json');

//Will have functions that handle all queries to the database. Abstracts away all database specific work. 
//Will only take params for queries, create connection, query database, then close connection
//This file deals with knowing whether a query requires either SQL or Cypher queries, and runs them as needed

//Functions in here will be imported by folders in routes to be then used in API calls
//Functions will start with CREATE, GET, SEARCH?, SET, ADD (relations only), REMOVE (relations only), DELETE
//Workflow is as follows [index.js -> routes -> Database (uses Postgres/Neo4jWrappers & data folder] 

//User functions
export function CreateUser() {
    sql.users.create.query;
    cypher.create.user.query;
}

export function GetUserId() { sql.users.select.query; } //Don't export and use internally?
export function GetUserCredentials() { sql.users.getCredentials.query; }
export function GetUserStatus() { sql.users.getStatus.query; }
export function GetUserPoints() { sql.user.getCredentials.query; }
export function GetUserProfile() { 
    sql.users.getMiniProfile.query; 
    sql.users.getProfileInformation.query; 
    cypher.select.friendsList.query; //move to separate function???
    //more when add other direction for cypher select queries
}
export function GetUserPosts() { sql.posts.getByUser.query; }

//Group these together?
export function SetUserCredentials() { 
    sql.users.updateUsername.query; 
    sql.users.updateEmail.query;
    sql.users.updatePassword.query;
}

export function SetUserData() {
    sql.users.updateImage.query;
    sql.users.updatePoints.query;
    sql.users.restrict.query;
    sql.users.private.query;
}

export function SearchUsers() {//TO BE EXPANDED
    sql.users.select.query;
    sql.users.selectSome.query;
    //cypher ???
} 

export function DeleteUser() { sql.users.delete.query; }

//Post Related Functions
export function CreatePost() { 
    sql.posts.create.query; 
    cypher.create.post.query;
}
export function ReplyToPost() {
    sql.posts.reply.query; 
    cypher.create.post.query;
}
export function EditPost() {
    sql.posts.editText.query;
    sql.posts.editImage.query;
    cypher.add.tagToPost;
    cypher.remove.tagFromPost;
}
export function EditPostLikes() {
    sql.posts.like.query;
    sql.posts.unlike.query;
    //ADD CYPHER QUERIES TO THIS
}
export function DeletePost() {
    sql.posts.delete.query;
    cypher.delete.post.query;
}
export function GetUserPosts() { sql.posts.getByUser.query; }
export function GetNetworkPosts() { sql.posts.getByNetwork.query; }
export function SearchPosts() { sql.posts.SEARCHING.query; }

//Resource Related Functions

export function GetShopDetails() { sql.resources.selectAll.query }
export function GetResourcesByCategory() { sql.resources.selectCategory }
export function GetResourcesByShape() { sql.resources.selectShape.query }
export function GetResourceDetails() { sql.resources.select.query }

//Network Related Functions 
export function GetNetworkId() { sql.networks.select.query; }
export function CreateNetwork() { 
    sql.networks.create.query;
    cypher.create.network.query;
}

export function SetNetworkName() { sql.networks.updateName.query; }
export function SetNetworkStatus() { sql.networks.private.query; }

export function GetNetworkMembers() { cypher.select.usersInNetwork.query; }
export function AddNetworkMember() { cypher.add.userToNetwork; }
export function RemoveNetworkMember() { cypher.remove.userFromNetwork; }

//Admin Commands (TBD)
export function GetNetworkAdmins() {}
export function AddNetworkAdmin() {}
export function RemoveNetworkAdmin() {}

export function SearchNetworks() {} //tbd

export function DeleteNetwork() {
    sql.networks.delete.query;
    cypher.delete.network.query;
}

//Tag Related Functions

//Image Related Functions
export function CreateImage() { sql.image.create.query; }
export function UpdateImage() { sql.image.update.query; }
export function DeleteImage() { sql.image.delete.query; }
export function GetImage() { sql.image.select.query; sql.image.selectSome.query; }

//Island Related Functions
export function CreateIsland() { sql.island.create.query; } //remove export and attach to create user
export function SetIslandPopulation() { sql.island.updatePeople.query; } 
export function SetIslandData() { sql.island.updatePeople.query; }
export function GetIslandData() {sql.island.select.query; }

//Request Related Functions

//Project Related Functions
export function CreateProject() { sql.projects.create.query; }
export function ModifyProject() { sql.projects.modify.query; }
export function SetProjectAsDone() { sql.projects.finish.query; }
export function DeleteProject() { sql.projects.delete.query; }

export function GetProjectId() { sql.projects.select.query; }
export function GetUsersProjects() { sql.projects.selectByUser.query; }