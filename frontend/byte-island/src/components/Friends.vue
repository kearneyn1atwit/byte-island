<template>
    <div>
        <v-dialog persistent v-model="showReplyToPost" v-if="showReplyToPost" max-width="500">
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
        <h1 class="header-h1 ml-2 mt-0 mb-1">Friends</h1>
        <v-text-field
                v-model="friendSearch"
                v-if="!friendVisited"
                density="compact"
                label="Search friends by username"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                bg-color="white"
                hide-details
                clearable
                single-line
                class="mx-3 mb-3 italic-search"
            ></v-text-field>
        <div v-if="!friendVisited">
            <v-list-item v-for="friend in filteredFriends" :key="friend.id">
                <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
                <v-row>
                    <v-col cols="auto">
                        <v-avatar class="mt-3 mr-n2" :image="'data:image/jpg;base64,'+friend.pfp" style="border: 1.5px solid white;"></v-avatar>
                    </v-col>
                    <v-col>
                        <pre class="mb-n1 mt-5">{{friend.username}}</pre>            
                    </v-col>    
                </v-row>
                <v-row class="my-0 mb-n1" justify="space-around">
                    <v-col cols="12">
                        <v-btn class="mr-3" color="success" variant="outlined" size="small" @click="visit(friend)">Visit</v-btn>
                        <v-btn color="red" variant="outlined" size="small" @click="unfriend(friend)">Un-friend</v-btn>
                    </v-col>
                </v-row>
            </v-list-item>
        </div>
    <v-list-item v-if="!loaded">
        <h1 class="text-center mt-5"><i>Loading...</i></h1>
    </v-list-item>    
    <v-list-item v-if="friends.length === 0 && !friendVisited && loaded">
        <h1 class="text-center mt-5"><i>You have no friends...</i></h1>
    </v-list-item>
    <v-list-item v-else-if="filteredFriends.length === 0 && !friendVisited && loaded">
        <h1 class="text-center mt-5"><i>No friends found...</i></h1>
    </v-list-item>
    <v-list-item v-if="friendVisited">
        <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
        <v-row align="center" class="mt-3">
            <v-col cols="auto">
                <v-avatar size="70" :image="'data:image/jpg;base64,'+visitedFriend.pfp" style="border: 1.5px solid white;"></v-avatar>
            </v-col>
            <v-col>
                <pre><h1 class="friend-text">{{visitedFriend.username}}</h1></pre>
                <pre>Friends since: <span class="text-muted">{{visitedFriend.friendsSince}}</span></pre>             
            </v-col>    
        </v-row>
        <v-btn-toggle rounded class="toggle-group mb-2 mt-5" v-model="friendsData" mandatory>
            <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86" @click="getFriendsProjects()">Projects</v-btn>
            <v-btn class="ma-1 toggle-btn text-lg" color="#98FF86" @click="getFriendsPosts()">Posts</v-btn>
        </v-btn-toggle>
        <div v-if="friendsData === 0">
            <v-list-item v-if="!friendProjectsLoaded">
                <h1 class="text-center mt-5"><i>Loading...</i></h1>
            </v-list-item>
            <v-list-item v-if="friendProjectsLoaded && friendsProjects.length === 0">
                <h1 class="text-center mt-5"><i>No projects found</i></h1>
            </v-list-item>  
            <v-list-item v-else v-for="project in friendsProjects" :key="project.Id">
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
                <pre v-if="project.Completed !== 'incomplete' && !project.Expired" class="header-h1 text-center mt-3"><i>COMPLETED!</i></pre>   
                <pre v-else-if="project.Expired" class="expired-proj text-center mt-3"><i>EXPIRED!</i></pre> 
            </v-list-item>
        </div>
        <div v-else>
            <!-- SHOW ALL POST TYPES -->
            <v-list-item v-if="!friendPostsLoaded">
                <h1 class="text-center mt-5"><i>Loading...</i></h1>
            </v-list-item>
            <v-list-item v-if="friendPostsLoaded && friendsPosts.length === 0">
                <h1 class="text-center mt-5"><i>No posts found</i></h1>
            </v-list-item> 
            <v-list-item v-for="post in friendsPosts" :key="post.Id">
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
.expired-proj {
    font-size: 2rem;
    color: red;
}
.friend-text {
    font-size: 175%;
    font-weight: italic !important;
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
</style>
<script src="./js/Friends.js">
</script>