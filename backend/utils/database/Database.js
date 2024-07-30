//Import Wrapper Classes
const psql = require('./PostgresWrapper');
const neo4j = require('./Neo4jWrapper');
const { Pool, QueryArrayResult } = require('pg');

//Import data (maybe move it to one file)
const sql = require('../../data/sql.json');
const cypher = require('../../data/cypher.json');

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
    //Creates user with the provided credentials
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

        //Create user island
        const newIsland = await psql.query(fillSQLParams(sql.island.create, {
            "id": userId,
            "path": "040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040404040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
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
    //Get user id from the provided username
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
    //Get user id from the provided email
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
    //Get the user from the provided email
    GetUserEmailUsed: async function(email) {
        const userWithEmail = await psql.query(fillSQLParams(sql.users.verifyEmailUnused, {
            "email": email
        }));
        return userWithEmail.rowCount > 0;
    },
    //Get the user's credential data from the user's id
    GetUserCredentials: async function(id, allowDeleted) { 
        if(allowDeleted) {
            const userData = await psql.query(fillSQLParams(sql.users.getAnyCredentials, {
                "id": id,
            }));
            return ProcessAndLogRowValues(userData,0);
        } else {
            const userData = await psql.query(fillSQLParams(sql.users.getCredentials, {
                "id": id,
            }));
            return ProcessAndLogRowValues(userData,0);
        }
    },
    //Get the user's status from their id
    GetUserStatus: async function(id) { 
        const userData = await psql.query(fillSQLParams(sql.users.getStatus, {
            "id": id,
        }));
        return ProcessAndLogRowValues(userData,0);
    },
    //Get all of the user's points from their id
    GetUserPoints: async function(id) { 
        const userData = await psql.query(fillSQLParams(sql.users.getPoints, {
            "id": id,
        }));
        return ProcessAndLogRowValues(userData,0);
    },
    //Get user profile data from a single id or an entire list
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
    //Get user's networks from their id
    GetUserNetworks: async function(id) {
        const networkIds = await neo4j.query(fillCypherParams(cypher.select.networksUserIsIn, {
            "IDVAR": id
        }));
        idlist = []
        networkIds.records.forEach(record => {
            idlist.push(record.get('n').properties.Id.low);
        });
        return idlist;
    },
    //Get user's liked posts from their id
    GetUserLikedPosts: async function(id) {
        const postIds = await neo4j.query(fillCypherParams(cypher.select.likedPosts, {
            "IDVAR": id
        }));
        idlist = []
        postIds.records.forEach(record => {
            idlist.push(record.get('p').properties.Id.low);
        });
        return idlist;
    },
    //Search users by the user's name, tag name, friends or networks
    SearchUsers: async function(search, byName, username) {

        let matchingUsers = [];

        if(byName === 0) {

            const exactUserMatch = await psql.query(fillSQLParams(sql.users.select, {
                "name": search
            }));

            console.log(exactUserMatch)
            try {
                const id = ProcessAndLogRowValues(exactUserMatch,0);

                //get image
                const profile = await psql.query(fillSQLParams(sql.users.getProfileInformation, {
                    "id": id['userid'],
                }));
                const userData = ProcessAndLogRowValues(profile,0);
                const imageData = await psql.query(fillSQLParams(sql.image.select, {
                    "id": userData['profileimageid']
                }));
                
                matchingUsers.push({
                    username: search,
                    userid: id['userid'],
                    pfp: imageData.rows[0]['imagepath']
                });
            } catch(e) {
                console.log("Exact match not found: " + e);
            }
    
            const partialUserMatches = await psql.query(fillSQLParams(sql.users.selectSome, {
                "name": search
            }));
    
            if(partialUserMatches.rowCount != 0) {
                for (const rowData of partialUserMatches.rows) {
                    if (rowData['username'] !== search) {
                        console.log("Pushing Partial match: " + rowData['username']);
            
                        const imageData = await psql.query(fillSQLParams(sql.image.select, {
                            "id": rowData['profileimageid']
                        }));
                        
                        matchingUsers.push({
                            username: rowData['username'],
                            userid: rowData['userid'],
                            pfp: imageData.rows[0]['imagepath']
                        });
                    }
                }
            }
        } else if(byName === 1) { //By Tags

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

                const imageData = await psql.query(fillSQLParams(sql.image.select, {
                    "id": userMiniProfile.rows[0]['profileimageid']
                }));

                matchingUsers.push({
                    username: userMiniProfile.rows[0]['username'],
                    userid: id,
                    pfp: imageData.rows[0]['imagepath']
                })
            }

        } else if (byName === 2) { //Friends list for provided user

            const user = await psql.query(fillSQLParams(sql.users.select, {
                "name": search,
            }));

            const friendIds = await neo4j.query(fillCypherParams(cypher.select.friendsList, {
                "IDVAR": user.rows[0]['userid']
            }));
            idlist = []
            sincelist = []
            friendIds.records.forEach(record => {
                idlist.push(record.get('f').properties.Id.low);
                sincelist.push(record.get('r').properties.SINCE);
            });

            for (i = 0; i < idlist.length; i++) {

                const id = idlist[i];

                try {
                    const userMiniProfile = await psql.query(fillSQLParams(sql.users.getProfileInformation, {
                        "id": id
                    }));

                    const imageData = await psql.query(fillSQLParams(sql.image.select, {
                        "id": userMiniProfile.rows[0]['profileimageid']
                    }));

                    const island = await psql.query(fillSQLParams(sql.island.select,  {
                        "id": id
                    }));
                    const islandData = ProcessAndLogRowValues(island, 0);

                    matchingUsers.push({
                        username: userMiniProfile.rows[0]['username'],
                        userid: id,
                        points: [userMiniProfile.rows[0]['careerpoints'],userMiniProfile.rows[0]['personalpoints'],userMiniProfile.rows[0]['socialpoints']],
                        island: islandData['datapath'],
                        friend: true,
                        friendsSince: sincelist[i].year.low+"-"+String(sincelist[i].month.low).padStart(2, '0')+"-"+String(sincelist[i].day.low).padStart(2, '0')+"T"+String(sincelist[i].hour.low).padStart(2, '0')+":"+String(sincelist[i].minute.low).padStart(2, '0')+":"+String(sincelist[i].second.low).padStart(2, '0'),
                        pfp: imageData.rows[0]['imagepath']
                    });
                } catch(err) {
                    console.log("Account was deleted so skip this iteration!");
                    continue;
                }
            }

        } else { //byName === 3 | Get users in provided network

            const network = await psql.query(fillSQLParams(sql.networks.select, {
                "name": search,
            }));

            const userIds = await neo4j.query(fillCypherParams(cypher.select.usersInNetwork, {
                "IDVAR": network.rows[0]['networkid']
            }));
            idlist = []
            userIds.records.forEach(record => {
                idlist.push(record.get('u').properties.Id.low);
            });

            const adminIds = await neo4j.query(fillCypherParams(cypher.select.networkAdmins, {
                "IDVAR": network.rows[0]['networkid']
            }));
            adminlist = []
            adminIds.records.forEach(record => {
                adminlist.push(record.get('u').properties.Id.low);
            });

            //Friends List Check
            const user = await psql.query(fillSQLParams(sql.users.select, {
                "name": username,
            }));

            const friendIds = await neo4j.query(fillCypherParams(cypher.select.friendsList, {
                "IDVAR": user.rows[0]['userid']
            }));
            friendlist = []
            sincelist = []
            friendIds.records.forEach(record => {
                friendlist.push(record.get('f').properties.Id.low);
                sincelist.push(record.get('r').properties.SINCE);
            });

            //Back to networks

            console.log(idlist);

            for (i = 0; i < idlist.length; i++) {

                const id = idlist[i];

                const userMiniProfile = await psql.query(fillSQLParams(sql.users.getProfileInformation, {
                    "id": id
                }));

                const imageData = await psql.query(fillSQLParams(sql.image.select, {
                    "id": userMiniProfile.rows[0]['profileimageid']
                }));

                const island = await psql.query(fillSQLParams(sql.island.select,  {
                    "id": id
                }));
                const islandData = ProcessAndLogRowValues(island, 0);

                matchingUsers.push({
                    username: userMiniProfile.rows[0]['username'],
                    userid: id,
                    points: [userMiniProfile.rows[0]['careerpoints'],userMiniProfile.rows[0]['personalpoints'],userMiniProfile.rows[0]['socialpoints']],
                    island: islandData['datapath'],
                    friend: friendlist.includes(id),
                    admin: adminlist.includes(id),
                    pfp: imageData.rows[0]['imagepath']
                });
            }
        }

        return matchingUsers;
    },
    //Update a user's credentials with provided dictionary
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
    //Update a user's data with provided dictionary   
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
    //Update a user's friends list from their id
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
    //Remove friendship link between two users
    RemoveUserFromFriendsList: async function(userId, formerFriendId) { 
        try {
            await neo4j.query(fillCypherParams(cypher.remove.usersFromFriends, {
                "IDVAR1": userId,
                "IDVAR2": formerFriendId
            }));
            return true;
        } catch(err) {
            console.log(err);
            return false;
        }
    },
    //Delete user by their username
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
    //Create a network with the provided data
    CreateNetwork: async function (name, description, private, imageid) { 

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
            "desc": description,
            "private": private,
            "image": imageid
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
    //Get the network id from the network name
    GetNetworkId: async function (name) { 
        const network = await psql.query(fillSQLParams(sql.networks.select, {
            "name": name
        }));
        return ProcessData(network.rows[0]['networkid']);
    },
    //Get the network name from their id
    GetNetworkName: async function (id) { 

        const network = await psql.query(fillSQLParams(sql.networks.getName, {
            "id": id
        }));
        return network.rows[0]['networkname'];
    },
    //Set network name with the provided id
    SetNetworkName: async function (id,name) { 
        await psql.query(fillSQLParams(sql.networks.updateName, {
            "id": id,
            "name": name
        }));
        return id;
    },
    //Switch a network status public<-->private by network id
    SetNetworkStatus: async function (id,private) { 
        await psql.query(fillSQLParams(sql.networks.private, {
            "id": id,
            "private": private
        }));
        return id;
    },
    //Get network members id
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
    //Network search by user's name or tag id
    SearchNetworks: async function(search, byName, username) {

        let matchingNetworks = [];

        const user = await psql.query(fillSQLParams(sql.users.select, {
            "name": username,
        }));

        const userid = user.rows[0]['userid'];

        if(byName === 0) { //Get networks list
            const exactNetworkMatch = await psql.query(fillSQLParams(sql.networks.select, {
                "name": search
            }));
            try {
                const networkData = ProcessAndLogRowValues(exactNetworkMatch,0);
                
                //Check for in network
                const memberIds = await neo4j.query(fillCypherParams(cypher.select.usersInNetwork, {
                    "IDVAR": networkData['networkid']
                }));
                memberlist = []
                memberIds.records.forEach(record => {
                    memberlist.push(record.get('u').properties.Id.low);
                });

                //Check for admin
                const adminIds = await neo4j.query(fillCypherParams(cypher.select.networkAdmins, {
                    "IDVAR": networkData['networkid']
                }));
                adminlist = []
                adminIds.records.forEach(record => {
                    adminlist.push(record.get('u').properties.Id.low);
                });

                //get image
                const imageData = await psql.query(fillSQLParams(sql.image.select, {
                    "id": networkData['imageid']
                }));

                matchingNetworks.push({
                    networkname: search,
                    networkdesc: networkData['networkdescription'],
                    networkid: networkData['networkid'],
                    private: networkData['privatenetwork'],
                    inNetwork: memberlist.includes(userid),
                    isAdmin: adminlist.includes(userid),
                    pfp: imageData.rows[0]['imagepath']
                });
            } catch(e) {
                console.log("Exact match not found: " + e);
            }
            const partialNetworkMatches = await psql.query(fillSQLParams(sql.networks.selectSome, {
                "name": search
            }));
    
            if(partialNetworkMatches.rowCount != 0) {
                for (const rowData of partialNetworkMatches.rows) {
                    if (rowData['networkname'] !== search) {
                        console.log("Pushing Partial match: " + rowData['networkname']);
            
                        //Check for in network
                        const memberIds = await neo4j.query(fillCypherParams(cypher.select.usersInNetwork, {
                            "IDVAR": rowData['networkid']
                        }));
                        memberlist = []
                        memberIds.records.forEach(record => {
                            memberlist.push(record.get('u').properties.Id.low);
                        });

                        const adminIds = await neo4j.query(fillCypherParams(cypher.select.networkAdmins, {
                            "IDVAR": rowData['networkid']
                        }));
            
                        let adminlist = [];
                        adminIds.records.forEach(record => {
                            adminlist.push(record.get('u').properties.Id.low);
                        });

                        //get image
                        const imageData = await psql.query(fillSQLParams(sql.image.select, {
                            "id": rowData['imageid']
                        }));
            
                        matchingNetworks.push({
                            networkname: rowData['networkname'],
                            networkdesc: rowData['networkdescription'],
                            networkid: rowData['networkid'],
                            private: rowData['privatenetwork'],
                            inNetwork: memberlist.includes(userid),
                            isAdmin: adminlist.includes(userid),
                            pfp: imageData.rows[0]['imagepath']
                        });
                    }
                }
            }
        } else if(byName === 1) { //Get networks by Tag names

            const networkIds = await neo4j.query(fillCypherParams(cypher.select.relatedNetworks, {
                "IDVAR": search
            }));
            idlist = []
            networkIds.records.forEach(record => {
                idlist.push(record.get('u').properties.Id.low);
            });

            for (const id of idlist) {

                const network = await psql.query(fillSQLParams(sql.network.select, {
                    "id": id
                }));

                const networkData = ProcessAndLogRowValues(network,0);

                //Check for admin
                const adminIds = await neo4j.query(fillCypherParams(cypher.select.networkAdmins, {
                    "IDVAR": id
                }));
                adminlist = []
                adminIds.records.forEach(record => {
                    adminlist.push(record.get('u').properties.Id.low);
                });

                //get image
                const imageData = await psql.query(fillSQLParams(sql.image.select, {
                    "id": networkData['imageid']
                }));

                matchingNetworks.push({
                    networkname: networkData['networkname'],
                    networkdesc: networkData['networkdescription'],
                    networkid: networkData['networkid'],
                    private: networkData['privatenetwork'],
                    inNetwork: memberlist.includes(userid),
                    isAdmin: adminlist.includes(userid),
                    pfp: imageData.rows[0]['imagepath']
                })
            }
        } else { //byName === 2 | Get Networks User is currently in

            const user = await psql.query(fillSQLParams(sql.users.select, {
                "name": search,
            }));

            const networkIds = await neo4j.query(fillCypherParams(cypher.select.networksUserIsIn, {
                "IDVAR": user.rows[0]['userid']
            }));
            idlist = []
            networkIds.records.forEach(record => {
                idlist.push(record.get('n').properties.Id.low);
            });

            console.log("idlist " + idlist)

            for (const id of idlist) {

                const network = await psql.query(fillSQLParams(sql.networks.getName, {
                    "id": id
                }));

                let networkData;

                try {
                    networkData = ProcessAndLogRowValues(network,0);
                } catch (err) {
                    continue;
                }

                //Check for admin
                const adminIds = await neo4j.query(fillCypherParams(cypher.select.networkAdmins, {
                    "IDVAR": id
                }));
                adminlist = []
                adminIds.records.forEach(record => {
                    adminlist.push(record.get('u').properties.Id.low);
                });

                console.log(networkData)

                //get image
                const imageData = await psql.query(fillSQLParams(sql.image.select, {
                    "id": networkData['imageid']
                }));
                
                matchingNetworks.push({
                    networkname: networkData['networkname'],
                    networkdesc: networkData['networkdescription'],
                    networkid: id,
                    private: networkData['privatenetwork'],
                    inNetwork: true,
                    isAdmin: adminlist.includes(userid),
                    pfp: imageData.rows[0]['imagepath']
                })
            }
        }

        return matchingNetworks;
    },
    //Add user to a network with their ids
    AddNetworkMember: async function (userid,networkid) { 
        const addCmd = await neo4j.query(fillCypherParams(cypher.add.userToNetwork, {
            "IDVAR1": userid,
            "IDVAR2": networkid
        })); 

        if(addCmd === undefined) {
            throw new Error("Error adding member to network!");
        }

        await psql.query(fillSQLParams(sql.networks.modifyMemberCount, {
            "id": networkid,
            "count": 1
        }));
    },
    //Remove user from a network with their ids
    RemoveNetworkMember: async function (userid,networkid) {
        try {
            const deleteCmd = await neo4j.query(fillCypherParams(cypher.remove.userFromNetwork, {
                "IDVAR1": userid,
                "IDVAR2": networkid
            }));  

            const deleteCmd2 = await neo4j.query(fillCypherParams(cypher.remove.userFromAdmins, {
                "IDVAR1": userid,
                "IDVAR2": networkid
            }));  
    
            if(deleteCmd === undefined || deleteCmd2 === undefined) {
                throw new Error("Error deleting member from network!");
            }
    
            await psql.query(fillSQLParams(sql.networks.modifyMemberCount, {
                "id": networkid,
                "count": -1
            }));

            return true;
        }
        catch(err) {
            console.log(err);
            return false;
        }
        
    },
    //Get network admins with the network id
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
    //Add user to network admins with their ids
    AddNetworkAdmin: async function (userid,networkid) {
        await neo4j.query(fillCypherParams(cypher.add.userAsAdmin, {
            "IDVAR1": userid,
            "IDVAR2": networkid
        })); 
    },
    //Remove user from network admins with their ids
    RemoveNetworkAdmin: async function (userid,networkid) {
        await neo4j.query(fillCypherParams(cypher.remove.userFromAdmins, {
            "IDVAR1": userid,
            "IDVAR2": networkid
        })); 
    },
    //Delete a network with its name
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
    //Create a post with the provided data
    CreatePost: async function(userid,text,imageid,parentid,networkid,private) { 

        if(userid === undefined || (text === undefined && image === undefined)) {
            throw new Error("Invalid data to create a post!");
        }

        params = { userid: userid }

        if(networkid !== undefined) {
            params['networkid'] = networkid;
        } else {
            params['networkid'] = null;
        }
        if(parentid !== undefined) {
            params['parentid'] = parentid;
        } else {
            params['parentid'] = null;
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
        if(imageid !== undefined) {
            params['private'] = private;
        } else {
            params['private'] = false;
        }

        //Create post in Postgres and verify its successfully added to the database
        const newPostRow = await psql.query(fillSQLParams(sql.posts.create, params));

        console.log(newPostRow[1]);
        const postId = newPostRow[1].rows[0]['postid'];
        console.log("New post is created with id: " + postId);
        

        //Use PostId returned back by Postgres to create corresponding Cypher node
        const newPostNode = await neo4j.query(fillCypherParams(cypher.create.post, {
            "IDVAR": postId
        })); 
        if(newPostNode === undefined) {
            throw new Error("Error adding post into Cypher database.");
        }

        return postId;
    },
    //Edit a post by the id with the new provided data
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
    //Get all user posts by the user id
    GetUserPosts: async function(id) { 
        const userPosts = await psql.query(fillSQLParams(sql.posts.getByUser, {
            "id":id
        }));
        return ProcessAndLogTableValues(userPosts);
    },
    //Get all replies to a post with the post id
    GetReplies: async function(id) { 
        const userPosts = await psql.query(fillSQLParams(sql.posts.getPostReplies, {
            "id":id
        }));
        return ProcessAndLogTableValues(userPosts);
    },
    //Get all network posts with the network id
    GetNetworkPosts: async function(id) { 
        const networkPosts = await psql.query(fillSQLParams(sql.posts.getByNetwork, {
            "id":id
        }));
        return ProcessAndLogTableValues(networkPosts);
    },
    //Get all post data with the post id
    GetPostDetails: async function(id) { 
        try {
            const postDetails = await psql.query(fillSQLParams(sql.posts.select, {
                "id":id
            }));
            return ProcessAndLogRowValues(postDetails, 0);
        }
        catch(err) {
            console.log(err);
            return undefined;
        }
    },
    //Like a post as a user with their ids
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
    //Unlike a post as a user with their ids
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
    //Delete a post with its id
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
    //Create a tag with the provided name
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
    //Add a tag to the given user with their ids
    AddTagToUser: async function(tagid,userid) {
        await neo4j.query(fillCypherParams(cypher.add.tagToUser, {
            "IDVAR1": tagid,
            "IDVAR2": userid
        })); 
    },
    //Add a tag to the given network with their ids
    AddTagToNetwork: async function(tagid,networkid) {
        await neo4j.query(fillCypherParams(cypher.add.tagToNetwork, {
            "IDVAR1": tagid,
            "IDVAR2": networkid
        })); 
    },
    //Add a tag to the given post with their ids
    AddTagToPost: async function(tagid,postid) {
        await neo4j.query(fillCypherParams(cypher.add.tagToPost, {
            "IDVAR1": tagid,
            "IDVAR2": postid
        })); 
    },
    //Search tag by name and whether you want only the exact match
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
    //Remove a tag from the given user with their ids
    RemoveTagFromUser: async function(tagid,userid) {
        await neo4j.query(fillCypherParams(cypher.remove.tagFromUser, {
            "IDVAR1": tagid,
            "IDVAR2": userid
        })); 
    },
    //Remove a tag from the given network with their ids
    RemoveTagFromNetwork: async function(tagid,networkid) {
        await neo4j.query(fillCypherParams(cypher.remove.tagFromNetwork, {
            "IDVAR1": tagid,
            "IDVAR2": networkid
        })); 
    },
    //Remove a tag from the given post with their ids
    RemoveTagFromPost: async function(tagid,postid) {
        await neo4j.query(fillCypherParams(cypher.remove.tagFromPost, {
            "IDVAR1": tagid,
            "IDVAR2": postid
        })); 
    },
    //Delete a tag with its id
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
    //Create an image with the provided encoded data
    CreateImage: async function (path) {
        const newImage = await psql.query(fillSQLParams(sql.image.create, {
            "path": path
        }));
        return ProcessData(newImage[1].rows[0]['imageid']);
    },
    //Get image data from the given id
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
    //Update an image with the provided data
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
    //Delete an image with the given id
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
    //Create the shop in the database
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
    //Get all data from the shop
    GetShopDetails: async function () { 
        const contents = await psql.query(sql.resources.selectAll.query);
        console.log("Shop Contents Are: ");
        return ProcessAndLogTableValues(contents);
    },
    //Retrieve data from the shop by the provided category
    GetResourcesByCategory: async function (category) { 
        const contents = await psql.query(fillSQLParams(sql.resources.selectCategory, {
            "category": category
        }));
        console.log("Resource Ids for Category " + category + " are: ");
        return ProcessAndLogColumnValues(contents, 0);
    },
    //Retrieve data from the shop by the provided shape
    GetResourcesByShape: async function (shape) { 
        const contents = await psql.query(fillSQLParams(sql.resources.selectShape, {
            "shape": shape
        }));
        console.log("Resource Ids for Shape " + shape + " are: ");
        return ProcessAndLogColumnValues(contents, 0);
    },
    //Retrieve data for the provided item with the given id
    GetResourceDetails: async function (id) { 
        const item = await psql.query(fillSQLParams(sql.resources.select,  {
            "id": id
        }));
        console.log("Resource is: ");
        return ProcessAndLogRowValues(item, 0);
    },

    //Island Related Functions
    //Set island population with the userid and number of people
    SetIslandPopulation: async function (id,people) { 
        const island = await psql.query(fillSQLParams(sql.island.updatePeople,  {
            "id": id,
            "people": people
        }));
        if(island.rowCount != 1) {
            throw new Error("Error updating population!");
        }
    },
    //Set island data with user id and new encoded island string
    SetIslandData: async function (id,path) { 
        const island = await psql.query(fillSQLParams(sql.island.updateData,  {
            "id": id,
            "path": path
        }));
        if(island.rowCount != 1) {
            throw new Error("Error updating island data!");
        }
    },
    //Get island data by the user id
    GetIslandData: async function (id) {
        const island = await psql.query(fillSQLParams(sql.island.select,  {
            "id": id
        }));
        return ProcessAndLogRowValues(island, 0);
    },
    //Get inventory information by the user id
    GetInventory: async function (id) {
        const inventory = await psql.query(fillSQLParams(sql.island.getWholeInventory,  {
            "userid": id
        }));
        return inventory.rows[0]['inventorydata'];
    },
    //Get the user's stock of a particular resource by the resource id
    GetStock: async function (userid, resourceid) { //dont know if we need this
        const inventory = await psql.query(fillSQLParams(sql.island.getWholeInventory,  {
            "userid": userid
        }));
        return inventory.rows[0]['inventorydata']['Item'+resourceid];
    },
    //Update the user's stock of a particular resource and handle all buying/selling
    SetStock: async function (userid, resourceid, quantity, buying) {

        const inventory = await psql.query(fillSQLParams(sql.island.getWholeInventory,  {
            "userid": userid,
            "resourceid": resourceid
        }));

        const userData = await psql.query(fillSQLParams(sql.users.getPoints, {
            "id": userid,
        }));
        const points = ProcessAndLogRowValues(userData,0); //Get User Current Points [career,personal,social]

        //User stock of the item
        const stock = inventory.rows[0]['inventorydata']['Item'+resourceid];

        //Resource data
        const resource = await psql.query(fillSQLParams(sql.resources.select, {
            "id": resourceid
        }));  
        const resourceData = ProcessAndLogRowValues(resource, 0);

        categories = ['career','personal','social']

        if(buying) {

            //Check that they are capable of buying the quantity of the item, if not return false
            if(resourceData['pointsvalue']*quantity > points[categories[resourceData['category']]+'points']) {
                return false;
            }

            params = {
                "id": userid,
                "social": 0,
                "career": 0,
                "personal": 0
            }

            if(resourceData['category'] === 0) { //Career
                params['career'] = resourceData['pointsvalue']*-quantity;
            } else if(resourceData['category'] === 1) { //Personal
                params['personal'] = resourceData['pointsvalue']*-quantity;
            } else { //Should be social
                params['social'] = resourceData['pointsvalue']*-quantity;
            }

            const updateUser = await psql.query(fillSQLParams(sql.users.updatePoints, params));

            //If they have enough points subtract points and add to stock
            const setStock = await psql.query(fillSQLParams(sql.island.setStock,  {
                "userid": userid,
                "resourceid": resourceid,
                "stock": (stock+quantity) //Increase stock by quantity purchased
            }));

        } else { //Selling logic

            //Check that they are possess all of the stock they wish to sell, if not return false
            if(quantity > stock) {
                return false;
            }

            //Give back 50% of sell price (rounded up) and reduce stock by amount sold
            params = {
                "id": userid,
                "social": 0,
                "career": 0,
                "personal": 0
            }

            if(resourceData['category'] === 0) { //Career
                params['career'] = Math.ceil((resourceData['pointsvalue']/2)*quantity);
            } else if(resourceData['category'] === 1) { //Personal
                params['personal'] = Math.ceil((resourceData['pointsvalue']/2)*quantity);
            } else { //Should be social
                params['social'] = Math.ceil((resourceData['pointsvalue']/2)*quantity);
            }

            const updateUser = await psql.query(fillSQLParams(sql.users.updatePoints, params));

            const setStock = await psql.query(fillSQLParams(sql.island.setStock,  {
                "userid": userid,
                "resourceid": resourceid,
                "stock": (stock-quantity) //Reduce stock by quantity sold
            }));
        }

        return true;
    },

    //Request Related Functions
    //Create a new friend or network join request
    CreateRequest: async function (senderid, targetid, targetIsUser) { 
        
        //Ensure not made for deleted entities
        //Query for request existing / make it so duplicates can't exist

        if(targetIsUser) {
            const friendRequest = await psql.query(fillSQLParams(sql.requests.requestFriend,  {
                "senderid": senderid,
                "userid": targetid
            }));
            if(friendRequest[0].rowCount != 1) {
                return -1;
            }
            return friendRequest[1].rows[0]['requestid']

        } else {
            const networkRequest = await psql.query(fillSQLParams(sql.requests.requestNetwork,  {
                "senderid": senderid,
                "networkid": targetid
            }));
            if(networkRequest[0].rowCount != 1) {
                return -1;
            }

            return networkRequest[1].rows[0]['requestid']
        }
    },
    //Resolve the request by the request id
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

        if(requestData.rows[0]['targetuserid'] !== null) { //Friend Request
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
    //Delete the request by the request id
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
    //Get all open requests for a user/network
    GetUserOpenRequests: async function (id, targetIsUser) { 

        if(targetIsUser) {
            const openFriendRequests = await psql.query(fillSQLParams(sql.requests.selectOpenFriendRequests,  {
                "userid": id,
            }));
            return ProcessAndLogTableValues(openFriendRequests);

        } else {

            const networkIds = await neo4j.query(fillCypherParams(cypher.select.networksUserIsIn, {
                "IDVAR": id
            }));
            idlist = []
            networkIds.records.forEach(record => {
                idlist.push(record.get('n').properties.Id.low);
            });

            let result = []

            //Iterate through networks user is a part of and then return them
            for(i = 0; i < idlist.length; i++) {

                const openJoinRequests = await psql.query(fillSQLParams(sql.requests.selectOpenNetworkRequests,  {
                    "networkid": idlist[i]
                }));

                let temp = ProcessAndLogTableValues(openJoinRequests)

                if(i !== 0) {
                    temp.shift();
                }

                result = result.concat(temp)
            };

            return result;
        }
    },
    //Get all pending requests for a user/network
    GetUserPendingRequests: async function (id, targetIsUser) { 

        if(targetIsUser) {
            const pendingFriendRequests = await psql.query(fillSQLParams(sql.requests.selectPendingFriendRequests,  {
                "senderid": id,
            }));
            return ProcessAndLogTableValues(pendingFriendRequests);

        } else {
            //Might need a change
            const pendingJoinRequests = await psql.query(fillSQLParams(sql.requests.selectPendingNetworkRequests,  {
                "senderid": id
            }));
            return ProcessAndLogTableValues(pendingJoinRequests);
        }
    },

    //Project Related Functions
    //Create a new project with the provided data
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
    //Modify the project with the provided dictionary by the id
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
        } else {
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

        if(data.hasOwnProperty('duedate')) {
            params['duedate'] = data['duedate'];
        } else {
            params['duedate'] = current['duedate'].toISOString();
        }
        
        await psql.query(fillSQLParams(sql.projects.modify, params));

        return id;
    },
    //Create a project update with the project id
    AddProjectUpdate: async function(projectid, updatename, updatedesc) {
        //Get currently existing project data
        let project = await psql.query(fillSQLParams(sql.projects.select, {
            "id": projectid
        }));
        let projectData = ProcessAndLogRowValues(project,0);

        //Iterate through updates until finding the most recent
        while(projectData['updateid'] !== null) {
            project = await psql.query(fillSQLParams(sql.projects.select, {
                "id": projectData['updateid']
            }));
            projectData = ProcessAndLogRowValues(project,0);
            console.log(projectData);
        }

        //Now create the new update
        const newUpdate = await psql.query(fillSQLParams(sql.projects.create, {
            "userid": projectData['userid'],
            "name": updatename,
            "desc": updatedesc,
            "social": projectData['socialpoints'],
            "career": projectData['careerpoints'],
            "personal": projectData['personalpoints'],
            "duedate": new Date(projectData['duedate']).toISOString()
        }));
        const updateId = ProcessData(newUpdate[1].rows[0]['projectid']);

        //Finally change the previous updateId to the "newly created projectid"
        const setUpdateId = await psql.query(fillSQLParams(sql.projects.setUpdateId, {
            "projectid": projectData['projectid'],
            "updateid": updateId
        }));

        return updateId;
    },
    //Set the project as done by the project id
    SetProjectAsDone: async function (id) { 

        const project = await psql.query(fillSQLParams(sql.projects.select, {
            "id": id
        }));
        data = ProcessAndLogRowValues(project,0);

        ontime = new Date().getTime() < new Date(data['duedate']).getTime();

        const finishCmd = await psql.query(fillSQLParams(sql.projects.finish, {
            "id": id,
            "ontime": ontime
        }));

        if(finishCmd.rowCount != 1) {
            throw new Error("Error marking project as done!");
        }

        if(ontime) {
            const updateUser = await psql.query(fillSQLParams(sql.users.updatePoints, {
                "id": data['userid'],
                "social": data['socialpoints'],
                "career": data['careerpoints'],
                "personal": data['personalpoints']
            }));
        } else {
            //Add mechanics here later
        }
    },
    //Delete the project with the given id
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
    //Get all project details by the project id
    GetProjectDetails: async function (id) { 
        const project = await psql.query(fillSQLParams(sql.projects.select, {
            "id": id
        }));
        return ProcessAndLogRowValues(project,0);
    },
    //Get user's projects by the user id
    GetUsersProjects: async function (userid) { 
        const projects = await psql.query(fillSQLParams(sql.projects.selectByUser, {
            "id": userid
        }));
        return ProcessAndLogTableValues(projects);
    },
    //Get all project updates by the project id
    GetProjectUpdates: async function (id) {
        const updates = await psql.query(fillSQLParams(sql.projects.getProjectUpdates, {
            "id": id
        }));
        return ProcessAndLogTableValues(updates);
    },

    //Notification Related Functions
    //Create a notification for the provided user id with the provided text
    CreateNotification: async function (id,text) { 
        const newNotif = await psql.query(fillSQLParams(sql.notifications.create, {
            "userid": id,
            "text": text
        }));
        return ProcessData(newNotif[1].rows[0]['notificationid']);
    },
    //Get all user notifications by the user id
    GetUserNotifications: async function (id) { 
        const userNotifs = await psql.query(fillSQLParams(sql.notifications.selectByUser, {
            "id": id,
        }));
        return ProcessAndLogTableValues(userNotifs);
    },
    //Mark the provided notification id as read
    MarkNotificationAsRead: async function (id) { 

        const markedNotif = await psql.query(fillSQLParams(sql.notifications.markAsRead, {
            "id": id
        }));
        return id;
    },
    //Delete the notification by its id
    DeleteNotification: async function (id) { 

        //Delete notif in postgres
        const deleteCmd = await psql.query(fillSQLParams(sql.notifications.delete, {
            "id": id
        }));

        return id;
    },
 }