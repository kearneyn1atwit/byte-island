//Import Wrapper Classes
const psql = require('./PostgresWrapper');
const neo4j = require('./Neo4jWrapper');
const { Pool, QueryArrayResult } = require('pg');

//Import data (maybe move it to one file)
const sql = require('../../data/sql.json');
const cypher = require('../../data/cypher.json');

//remove params in data files later?
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

    //Image Functions
    CreateImage: async function (path) {
        const newImage = await psql.query(fillSQLParams(sql.image.create, {
            "path": path
        }));
        return ProcessData(newImage[1].rows[0]['imageid']);
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
