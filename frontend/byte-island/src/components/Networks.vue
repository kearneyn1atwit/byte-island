<template>
    <div>
        <v-dialog v-model="showEditNetwork" v-if="showEditNetwork" max-width="500" scrollable persistent>
            <template v-slot:default="{}">
                <v-card :title="'Editing Network: '+editNetworkName">
                <v-card-text style="border-top: 1.5px solid gray;">
                    <h2 class="mb-2 mt-3">Network type</h2>
                    <v-btn-toggle rounded class="toggle-group mb-2" v-model="editNetworkType" mandatory>
                        <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86">Public</v-btn>
                        <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86">Private</v-btn>
                    </v-btn-toggle>
                    <h4 class="mt-3">Enter network name:</h4>
                    <v-text-field clearable counter="50" persistent-counter maxlength="50" variant="outlined" class="mt-3 mb-n5" placeholder="Network Name" persistent-placeholder v-model="editNetworkName"></v-text-field>
                    <h4 class="mt-3">Describe your new network:</h4>
                    <v-textarea clearable maxlength="500" counter persistent-counter v-model="editNetworkDesc" no-resize variant="outlined" class="mt-3 mb-n5" placeholder="Network Description" persistent-placeholder></v-textarea>
                    <h4 class="mt-3">Choose network picture:</h4>
                    <v-btn class="mt-3" variant="outlined" color="primary" @click="chooseNetworkPic('edit')">
                        Choose file
                    </v-btn>
                    <input type="file" accept="image/jpeg" ref="networkPicEdit" id="networkPicEdit" style="display: none;">
                    <pre class="mt-5"><b>Image preview:</b></pre>
                    <div class="mt-5 text-center" id="imagePrevEdit"></div>
                </v-card-text>

                <v-card-actions class="mb-3" style="border-top: 1.5px solid gray;">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Cancel"
                    class="mr-3 mt-3"
                    variant="outlined"
                    color="red"
                    @click="showEditNetwork = false; editNetworkName = ''; editNetworkPic = ''; editNetworkType = 0; editNetworkDesc = ''"
                    ></v-btn>
                    <v-btn
                    class="mr-3 mt-3"
                    :disabled="!editNetworkName || !editNetworkDesc || !editNetworkPic"
                    text="Update"
                    variant="outlined"
                    color="primary"
                    @click="confirmEdit()"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <v-dialog v-model="showDelNetwork" max-width="500" persistent>
            <template v-slot:default="{}">
                <v-card :title="'Delete Network: '+toDelNetwork.networkname">
                <v-card-text>
                    <h2 style="color: red;"><b>Are you sure you want to delete this network? This action is irreversible.</b></h2>
                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="No"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showDelNetwork = false"
                    ></v-btn>
                    <!-- disable if password entered is not current password (CHANGE) -->
                    <v-btn
                    text="Yes"
                    variant="outlined"
                    color="primary"
                    @click="confirmDeleteNetwork(toDelNetwork)"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <v-dialog v-model="showLeaveNetwork" max-width="500" persistent>
            <template v-slot:default="{}">
                <v-card :title="'Leave Network: '+leaveNetwork.networkname">
                <v-card-text>
                    <h4><b>Are you sure you want to leave this network?</b></h4>
                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="No"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showLeaveNetwork = false"
                    ></v-btn>
                    <!-- disable if password entered is not current password (CHANGE) -->
                    <v-btn
                    text="Yes"
                    variant="outlined"
                    color="primary"
                    @click="leave(leaveNetwork,username,'networks')"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <v-dialog v-model="showNewNetwork" v-if="showNewNetwork" max-width="500" scrollable persistent>
            <template v-slot:default="{}">
                <v-card title="Create New Network">
                <v-card-text style="border-top: 1.5px solid gray;">
                    <h2 class="mb-2 mt-3"><i>Make new network...</i></h2>
                    <v-btn-toggle rounded class="toggle-group mb-2" v-model="newNetworkType" mandatory>
                        <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86">Public</v-btn>
                        <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86">Private</v-btn>
                    </v-btn-toggle>
                    <h4 class="mt-3">Enter network name:</h4>
                    <v-text-field clearable counter="50" persistent-counter maxlength="50" variant="outlined" class="mt-3 mb-n5" placeholder="Network Name" persistent-placeholder v-model="newNetworkName"></v-text-field>
                    <h4 class="mt-3">Describe your new network:</h4>
                    <v-textarea clearable maxlength="500" counter persistent-counter v-model="newNetworkDesc" no-resize variant="outlined" class="mt-3 mb-n5" placeholder="Network Description" persistent-placeholder></v-textarea>
                    <h4 class="mt-3">Choose network picture:</h4>
                    <v-btn class="mt-3" variant="outlined" color="primary" @click="chooseNetworkPic('new')">
                        Choose file
                    </v-btn>
                    <input type="file" accept="image/jpeg" ref="networkPic" id="networkPic" style="display: none;">
                    <pre class="mt-5"><b>Image preview:</b></pre>
                    <div class="mt-5 text-center" id="imagePrev"></div>
                </v-card-text>

                <v-card-actions class="mb-3" style="border-top: 1.5px solid gray;">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Cancel"
                    class="mr-3 mt-3"
                    variant="outlined"
                    color="red"
                    @click="showNewNetwork = false; newNetworkName = ''; newNetworkPic = ''; newNetworkType = 0; newNetworkDesc = ''"
                    ></v-btn>
                    <v-btn
                    class="mr-3 mt-3"
                    :disabled="!newNetworkName || !newNetworkDesc || !newNetworkPic"
                    text="Create"
                    variant="outlined"
                    color="primary"
                    @click="confirmCreation()"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <v-dialog v-model="showReplyToPost" v-if="showReplyToPost" max-width="500" persistent>
            <template v-slot:default="{}">
                <v-card :title="'Reply to Post from '+replyPost.User">
                <v-card-text>
                    <h1 class="mt-3">Enter your reply to:</h1>
                    <pre class="mx-5 mt-3" style="white-space: pre-wrap; word-wrap: break-word;">{{replyPost.Text}}</pre>
                    
                    <v-textarea counter="200" persistent-counter maxlength="200" clearable no-resize v-model="reply" rows="10" variant="outlined" placeholder="Enter reply..." bg-color="white" class="mb-n5 mt-5"></v-textarea>

                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Cancel"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showReplyToPost = false; reply = ''"
                    ></v-btn>
                    <v-btn
                    text="Reply"
                    variant="outlined"
                    color="primary"
                    :disabled="!reply"
                    @click="confirmReply(replyPost)"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <h1 class="header-h1 ml-2 mt-0 mb-1">My Networks</h1>
        <v-btn v-if="!networkVisited && !userVisited" variant="outlined" color="success" class="ml-2 custom-btn mb-5 mt-2" @click="newNetwork()">Create New!</v-btn>
        <v-text-field
                v-model="networkSearch"
                v-if="!networkVisited && !userVisited"
                density="compact"
                label="Search networks"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                bg-color="white"
                hide-details
                clearable
                single-line
                class="mx-3 mb-3 italic-search"
            ></v-text-field>
        <div v-if="!networkVisited && !userVisited">
            <v-list-item v-for="network in filteredNetworks" :key="network.networkid">
                <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
                <v-row>
                    <v-col cols="auto">
                        <v-avatar class="mt-3 mr-n2" :image="'data:image/jpg;base64,'+network.pfp" style="border: 1.5px solid white;"></v-avatar>
                    </v-col>
                    <v-col>
                        <pre class="mb-n1 mt-5">{{network.networkname}}</pre>            
                    </v-col>    
                </v-row>
                <v-row class="my-0 mb-n1" justify="space-around">
                    <v-col cols="12">
                        <v-btn class="mr-3" color="success" variant="outlined" size="small" @click="view(network)">View</v-btn>
                        <!-- V-if user is admin of network -->
                        <v-btn class="mr-3" color="red" variant="outlined" size="small" @click="showLeave(network)">Leave</v-btn>
                        <!-- V-if user is admin of network -->
                        <v-btn color="red" variant="outlined" size="small" @click="delNetwork(network)" v-if="network.isAdmin">Delete Network</v-btn>
                    </v-col>
                </v-row>
            </v-list-item>
        </div>
        <v-list-item v-if="!networksLoaded">
            <h1 class="text-center mt-5"><i>Loading...</i></h1>
        </v-list-item>
        <v-list-item v-if="networks.length === 0 && !networkVisited && !userVisited && networksLoaded">
            <h1 class="text-center mt-5"><i>You are not part of any networks...</i></h1>
        </v-list-item>
        <v-list-item v-else-if="filteredNetworks.length === 0 && !networkVisited && !userVisited && networksLoaded">
            <h1 class="text-center mt-5"><i>No networks found...</i></h1>
        </v-list-item>
        <v-list-item v-if="networkVisited">
            <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
            <v-row align="center" class="my-0">
                <v-col cols="auto">
                    <v-avatar size="70" :image="'data:image/jpg;base64,'+viewedNetwork.pfp" style="border: 1.5px solid white;"></v-avatar>
                </v-col>
                <v-col>
                    <pre style="white-space: pre-wrap; word-wrap: break-word;"><h1><b>{{viewedNetwork.networkname}}</b></h1></pre>
                    <pre style="white-space: pre-wrap; word-wrap: break-word;"><b>Members</b>: {{usersLoaded ? networkUsers.length : '...'}}</pre> 
                    
                </v-col>    
            </v-row>
            <div class="ml-1 mb-3">
                <pre style="white-space: pre-wrap; word-wrap: break-word;" v-if="showDesc || viewedNetwork.networkdesc.length <= 100"><b>About</b>: {{viewedNetwork.networkdesc}}</pre>
                <pre style="white-space: pre-wrap; word-wrap: break-word;" v-else><b>About</b>: {{viewedNetwork.networkdesc.substring(0,100)}}...</pre>
                <div v-if="viewedNetwork.networkdesc.length > 100">
                    <pre><span class="desc-text" @click="showDesc = !showDesc" v-if="!showDesc">Read more</span></pre>
                    <pre><span class="desc-text" @click="showDesc = !showDesc" v-if="showDesc">Hide description</span></pre>          
                </div>
            </div>
            <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-1">
            <v-text-field
                v-model="userSearch"
                v-if="networkVisited && !userVisited"
                density="compact"
                label="Search users"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                bg-color="white"
                hide-details
                clearable
                single-line
                class="my-3 italic-search"
            ></v-text-field>
            <v-list-item v-for="(user,index) in filteredUsers" :key="user.id">
                    <hr v-if="index > 0" style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-1">
                <v-row>
                    <v-col cols="auto">
                        <v-avatar class="mt-3 mr-n2" :image="'data:image/jpg;base64,'+user.pfp" style="border: 1.5px solid white;"></v-avatar>
                    </v-col>
                    <v-col cols="auto">
                        <pre class="mb-n1 mt-5">{{user.username}}</pre>            
                    </v-col>    
                    <v-col v-if="user.admin">
                        <div class="mb-n1 mt-4"><v-icon icon="mdi-star" color="yellow" title="Admin" size="large"></v-icon></div>
                    </v-col>
                </v-row>
                <v-row class="my-0 mb-n1" justify="space-around" v-if="user.username !== username">
                    <v-col cols="12">
                        <v-btn class="mr-3" color="success" variant="outlined" size="small" @click="visit(user)">Visit</v-btn>
                        <v-btn v-if="!user.friend" class="mr-3" color="success" variant="outlined" size="small" @click="friend(user)">Friend</v-btn>
                        <v-btn v-else color="red" class="mr-3" variant="outlined" size="small" @click="unfriend(user)">Un-friend</v-btn>
                        <v-btn v-if="!user.admin && currentUserAdmin" class="mr-3" color="success" variant="outlined" size="small" @click="admin(user,viewedNetwork)">Make admin</v-btn>
                        <v-btn v-else-if="user.admin && currentUserAdmin" class="mr-3" color="red" variant="outlined" size="small" @click="unadmin(user,viewedNetwork)">Remove admin</v-btn>
                        <v-btn v-if="!user.admin && currentUserAdmin" color="red" variant="outlined" size="small" @click="leave(viewedNetwork,user.username,'users')">Kick user</v-btn>
                    </v-col>
                </v-row>    
                </v-list-item>
                <v-list-item v-if="!usersLoaded">
                    <h1 class="text-center mt-5"><i>Loading...</i></h1>
                </v-list-item>
                <v-list-item v-if="networkUsers.length === 0 && networkVisited && !userVisited && usersLoaded">
                    <h1 class="text-center mt-5"><i>No other users are in this network...</i></h1>
                </v-list-item>
                <v-list-item v-else-if="filteredUsers.length === 0 && networkVisited && !userVisited && usersLoaded">
                    <h1 class="text-center mt-5"><i>No users found...</i></h1>
                </v-list-item>
        </v-list-item>
        <v-list-item v-if="userVisited">
                    <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
                    <v-row align="center" class="mt-0">
                        <v-col cols="auto">
                            <v-avatar size="70" :image="'data:image/jpg;base64,'+visitedUser.pfp" style="border: 1.5px solid white;"></v-avatar>
                        </v-col>
                        <v-col>
                            <pre><h1 class="friend-text">{{visitedUser.username}}</h1></pre>
                            <pre v-if="visitedUser.friendsSince">Friends since: <span class="text-muted">{{visitedUser.friendsSince}}</span></pre>             
                        </v-col>    
                    </v-row>
                    <v-btn-toggle rounded class="toggle-group mb-2 mt-5" v-model="usersData" mandatory>
                        <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86" @click="getUsersProjects()">Projects</v-btn>
                        <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86" @click="getUsersPosts()">Posts</v-btn>
                    </v-btn-toggle>
                    <div v-if="usersData === 0">
                        <v-list-item v-if="!userProjectsLoaded">
                            <h1 class="text-center mt-5"><i>Loading...</i></h1>
                        </v-list-item>
                        <v-list-item v-if="userProjectsLoaded && usersProjects.length === 0">
                            <h1 class="text-center mt-5"><i>No projects found</i></h1>
                        </v-list-item>  
                            <v-list-item v-else v-for="project in usersProjects" :key="project.Id">
                            <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                            <pre v-if="project.Completed === 'incomplete'" class="text-muted ml-1">&emsp;Due: {{project.Due}}</pre>
                            <pre v-else class="text-muted ml-1">&emsp;Completed: {{project.Completed}}</pre>
                            <pre class="text-muted ml-1">&emsp;Points: <span style="color: rgb(215,0,0);">{{project.Points[0]}}</span>, <span style="color: rgb(151,255,45);">{{project.Points[1]}}</span>, <span style="color: rgb(101,135,231);">{{project.Points[2]}}</span></pre>
                            <h1 class="ml-3">{{project.Title}}</h1>
                            <p class="ml-3" v-for="update in project.Updates" :key="update.Id">
                                <br>
                                <h3 class="text-muted">{{update.Name}} [{{update.Date}}]:</h3>
                                <span class="text-muted">{{update.Desc}}</span>
                                <br>
                            </p>
                            <p v-if="project.Updates.length === 0" class="ml-3">
                                <br>
                                <h3 class="text-muted"><i>This project has no updates.</i></h3>
                                <br>
                            </p>
                            <pre v-if="project.Completed !== 'incomplete'" class="header-h1 text-center mt-3"><i>COMPLETED!</i></pre>    
                        </v-list-item>
                    </div>
                    <div v-else>
                        <!-- SHOW ONLY PUBLIC POSTS IF NOT FRIENDS -->
                        <v-list-item v-if="!userPostsLoaded">
                            <h1 class="text-center mt-5"><i>Loading...</i></h1>
                        </v-list-item>
                        <v-list-item v-if="userPostsLoaded && usersPosts.length === 0">
                            <h1 class="text-center mt-5"><i>No posts found</i></h1>
                        </v-list-item> 
                        <v-list-item v-else v-for="post in usersPosts" :key="post.Id">
                            <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                            <v-row align="center">
                                <v-col :class="post.Replies.length > 0 ? 'ml-3' : 'ml-3 mb-3'">
                                    <pre>{{post.Datetime}}</pre>
                                    <pre style="white-space: pre-wrap; word-wrap: break-word;"><b>{{post.User}}</b>: {{post.Text}}</pre>
                                    <!-- change color based on if post is liked -->
                                    <div class="mt-2">
                                        <v-icon size="20" class="mr-3" :color="post.LikedPost ? 'blue' : 'white'" @click="like(post)" icon="mdi-thumb-up"></v-icon><pre :class="post.LikedPost ? 'blue-like' : 'white-like'" style="font-size: 17px; display: inline;"><b>{{post.Likes}}</b></pre>
                                    </div>
                                    <div v-if="!post.HideReplies">
                                        <div class="mx-10 my-7" v-for="reply in post.Replies" :key="reply.Id" >
                                            <pre class="reply-text">{{reply.Datetime}}</pre>
                                            <pre class="reply-text" style="white-space: pre-wrap; word-wrap: break-word;"><b>{{reply.User}}</b>: {{reply.Text}}</pre>
                                        </div>
                                    </div>
                                    <div v-if="post.Replies.length > 0" class="w-100">
                                        <v-btn :class=" post.HideReplies ? 'mr-5 mt-3 mb-1' : 'mr-5 mt-n3 mb-3'" size="small" variant="outlined" @click='replyToPost(post)'>Reply</v-btn>
                                        <v-btn :class=" post.HideReplies ? 'hide-btn mt-3 mb-1' : 'mt-n3 mb-3 hide-btn'" variant="outlined" size="small" @click="post.HideReplies = !post.HideReplies"><span v-if="!post.HideReplies">Hide</span><span v-else>Show</span>&nbsp;replies</v-btn>
                                    </div>
                                    <div v-else>
                                        <v-btn class="mt-3 mb-n1" size="small" variant="outlined" @click='replyToPost(post)'>Reply</v-btn>
                                    </div>
                                </v-col>
                            </v-row>
                        </v-list-item>
                    </div>
                </v-list-item>
    </div>
</template>
<style scoped>
pre {
    white-space: pre-wrap;
    word-wrap: break-word;
}
.header-h1 {
    font-size: 2rem;
    color: rgb(152,255,134);
}
.toggle-group {
    border-radius: 10px !important;
    height: 100%;
    border: 3px solid #98FF86;
    width: calc(100% - 8px);
}
.toggle-btn {
    width: calc(50% - 8px);
    border-radius: 5px !important;
    height: 35px !important;
}
.text-lg {
    font-size: 125%;
}
.text-muted {
    color: grey;
}
.reply-text {
    color: rgb(207,255,218);
}
.hide-btn {
    color: rgb(152,255,134);
}
.blue-like {
    color: #2196F3;
}
.white-like {
    color: white;
}
.desc-text {
    color: #2196F3;
    text-decoration: underline;
    cursor: pointer;
}
.desc-text:hover {
    color: #8fcaf9;
}
</style>
<script src="./js/Networks.js">
</script>