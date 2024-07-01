<template>
    <div>
        <v-dialog v-model="showNewNetwork" v-if="showNewNetwork" max-width="500">
            <template v-slot:default="{}">
                <v-card title="Create New Network">
                <v-card-text>
                    <h4 class="mt-3">Enter network name:</h4>
                    <v-text-field counter="50" persistent-counter maxlength="50" variant="outlined" class="mt-3 mb-n5" placeholder="Network Name" persistent-placeholder v-model="newNetworkName"></v-text-field>
                    <h4 class="mt-3">Choose network picture:</h4>
                    <v-btn class="mt-3" variant="outlined" color="primary" @click="chooseNetworkPic()">
                        Choose file
                    </v-btn>
                    <input type="file" accept="image/png, image/jpeg" ref="networkPic" id="networkPic" style="display: none;">
                    <pre class="mt-5"><b>Image preview:</b></pre>
                    <div class="mt-5 text-center" id="imagePrev"></div>
                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Cancel"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showNewNetwork = false; newNetworkName = ''; newNetworkPic = ''; networkPicLen = 0"
                    ></v-btn>
                    <v-btn
                    :disabled="!newNetworkName"
                    text="Create"
                    variant="outlined"
                    color="primary"
                    @click="confirmCreation()"
                    ></v-btn>
                </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
        <v-dialog v-model="showReplyToPost" v-if="showReplyToPost" max-width="500">
            <template v-slot:default="{}">
                <v-card :title="'Reply to Post from '+replyPost.user">
                <v-card-text>
                    <h1 class="mt-3">Enter your reply to:</h1>
                    <pre class="mx-5 mt-3" style="white-space: pre-wrap; word-wrap: break-word;">{{replyPost.text}}</pre>
                    
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
            <v-list-item v-for="network in filteredNetworks" :key="network.id">
                <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
                <v-row>
                    <v-col cols="auto">
                        <v-avatar class="mt-3 mr-n2" :image="network.pfp" style="border: 1.5px solid white;"></v-avatar>
                    </v-col>
                    <v-col>
                        <pre class="mb-n1 mt-5">{{network.name}}</pre>            
                    </v-col>    
                </v-row>
                <v-row class="my-0 mb-n1" justify="space-around">
                    <v-col cols="12">
                        <v-btn class="mr-3" color="success" variant="outlined" size="small" @click="view(network)">View</v-btn>
                        <v-btn color="red" variant="outlined" size="small" @click="leave(network)">Leave</v-btn>
                    </v-col>
                </v-row>
            </v-list-item>
        </div>
        <v-list-item v-if="networks.length === 0 && !networkVisited && !userVisited">
            <h1 class="ml-0"><i>You are not part of any networks</i></h1>
        </v-list-item>
        <v-list-item v-else-if="filteredNetworks.length === 0 && !networkVisited && !userVisited">
            <h1 class="ml-0"><i>No networks found</i></h1>
        </v-list-item>
        <v-list-item v-if="networkVisited">
            <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
            <v-row align="center" class="my-0">
                <v-col cols="auto">
                    <v-avatar size="70" :image="viewedNetwork.pfp" style="border: 1.5px solid white;"></v-avatar>
                </v-col>
                <v-col>
                    <pre><h1>{{viewedNetwork.name}}</h1></pre>           
                </v-col>    
            </v-row>
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
                        <v-avatar class="mt-3 mr-n2" :image="user.pfp" style="border: 1.5px solid white;"></v-avatar>
                    </v-col>
                    <v-col cols="auto">
                        <pre class="mb-n1 mt-5">{{user.username}}</pre>            
                    </v-col>    
                    <v-col v-if="user.admin">
                        <div class="mb-n1 mt-4"><v-icon icon="mdi-star" color="yellow" title="Admin" size="large"></v-icon></div>
                    </v-col>
                </v-row>
                <v-row class="my-0 mb-n1" justify="space-around">
                    <v-col cols="12">
                        <v-btn class="mr-3" color="success" variant="outlined" size="small" @click="visit(user)">Visit</v-btn>
                        <v-btn v-if="!user.friend" color="success" variant="outlined" size="small" @click="friend(user)">Friend</v-btn>
                        <v-btn v-else color="red" variant="outlined" size="small" @click="unfriend(user)">Un-friend</v-btn>
                    </v-col>
                </v-row>    
                </v-list-item>
                <v-list-item v-if="networkUsers.length === 0 && networkVisited && !userVisited">
                    <h1 class="ml-0"><i>No other users are in this network</i></h1>
                </v-list-item>
                <v-list-item v-else-if="filteredUsers.length === 0 && networkVisited && !userVisited">
                    <h1 class="ml-0"><i>No users found</i></h1>
                </v-list-item>
        </v-list-item>
        <v-list-item v-if="userVisited">
                    <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
                    <v-row align="center" class="mt-0">
                        <v-col cols="auto">
                            <v-avatar size="70" :image="visitedUser.pfp" style="border: 1.5px solid white;"></v-avatar>
                        </v-col>
                        <v-col>
                            <pre><h1 class="friend-text">{{visitedUser.username}}</h1></pre>
                            <pre v-if="visitedUser.friendsSince">Friends since: <span class="text-muted">{{visitedUser.friendsSince}}</span></pre>             
                        </v-col>    
                    </v-row>
                    <v-btn-toggle rounded class="toggle-group mb-2 mt-5" v-model="usersData" mandatory>
                        <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86" @click="resetHideReplies()">Projects</v-btn>
                        <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86">Posts</v-btn>
                    </v-btn-toggle>
                    <div v-if="usersData === 0">
                            <v-list-item v-for="project in userProjects" :key="project.id">
                            <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                            <pre v-if="project.completed === 'incomplete'" class="text-muted ml-1">&emsp;Due: {{project.due}}</pre>
                            <pre v-else class="text-muted ml-1">&emsp;Completed: {{project.completed}}</pre>
                            <pre class="text-muted ml-1">&emsp;Points: <span style="color: rgb(215,0,0);">{{project.points[0]}}</span>, <span style="color: rgb(151,255,45);">{{project.points[1]}}</span>, <span style="color: rgb(101,135,231);">{{project.points[2]}}</span></pre>
                            <h1 class="ml-3">{{project.title}}</h1>
                            <p class="ml-3" v-for="update in project.updates" :key="update.id">
                                <br>
                                <h3 class="text-muted">{{update.name}} [{{update.date}}]:</h3>
                                <span class="text-muted">{{update.desc}}</span>
                                <br>
                            </p>
                            <p v-if="project.updates.length === 0" class="ml-3">
                                <br>
                                <h3 class="text-muted"><i>This project has no updates.</i></h3>
                                <br>
                            </p>
                            <pre v-if="project.completed !== 'incomplete'" class="header-h1 text-center mt-3"><i>COMPLETED!</i></pre>    
                        </v-list-item>
                    </div>
                    <div v-else>
                        <!-- SHOW ONLY PUBLIC POSTS -->
                        <v-list-item v-for="post in usersPosts" :key="post.id">
                            <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                            <v-row align="center">
                                <v-col :class="post.replies.length > 0 ? 'ml-3' : 'ml-3 mb-3'">
                                    <pre>{{post.datetime}}</pre>
                                    <pre style="white-space: pre-wrap; word-wrap: break-word;"><b>{{post.user}}</b>: {{post.text}}</pre>
                                    <div v-if="!post.hideReplies">
                                        <div class="mx-10 my-7" v-for="reply in post.replies" :key="reply.id" >
                                            <pre class="reply-text">{{reply.datetime}}</pre>
                                            <pre class="reply-text" style="white-space: pre-wrap; word-wrap: break-word;"><b>{{reply.user}}</b>: {{reply.text}}</pre>
                                        </div>
                                    </div>
                                    <div v-if="post.replies.length > 0" class="w-100">
                                        <v-btn :class=" post.hideReplies ? 'mr-5 mt-3 mb-1' : 'mr-5 mt-n3 mb-3'" size="small" variant="outlined" @click='replyToPost(post)'>Reply</v-btn>
                                        <v-btn :class=" post.hideReplies ? 'hide-btn mt-3 mb-1' : 'mt-n3 mb-3 hide-btn'" variant="outlined" size="small" @click="post.hideReplies = !post.hideReplies"><span v-if="!post.hideReplies">Hide</span><span v-else>Show</span>&nbsp;replies</v-btn>
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
</style>
<script src="./js/Networks.js">
</script>