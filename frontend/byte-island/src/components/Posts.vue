<template>
    <div>
        <v-dialog v-model="showNewPost" max-width="500">
            <template v-slot:default="{}">
                <v-card title="New Post">
                <v-card-text>
                    <h1 class="mt-3">Make next post...</h1>
                    <v-btn-toggle rounded class="toggle-group toggle-group-2 mt-2" v-model="newPostTab" mandatory>
                        <v-btn class="ma-1 toggle-btn toggle-btn-2 toggle-btn-sm" color="#98FF86">Public</v-btn>
                        <v-btn class="ma-1 toggle-btn toggle-btn-2 toggle-btn-sm" color="#98FF86">Friends-Only</v-btn>
                    </v-btn-toggle>
                    <v-textarea clearable counter="500" persistent-counter maxlength="500" no-resize v-model="newPost" rows="10" variant="outlined" placeholder="Enter message..." bg-color="white" class="mb-n5 mt-5"></v-textarea>

                </v-card-text>

                <v-card-actions class="mb-3 mx-3">
                    <v-spacer></v-spacer>

                    <v-btn
                    text="Cancel"
                    class="mr-3"
                    variant="outlined"
                    color="red"
                    @click="showNewPost = false; newPostTab = 0; newPost = ''"
                    ></v-btn>
                    <v-btn
                    text="Post"
                    variant="outlined"
                    color="primary"
                    :disabled="!newPost"
                    @click="post()"
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
        <h1 class="header-h1 ml-2 my-0">My Posts</h1>
        <v-btn @click="showNewPost = true" variant="outlined" color="success" class="my-3 ml-2 custom-btn">New post</v-btn>
        <h2 class="ml-2 mb-1">Show me...</h2>
        <v-btn-toggle rounded class="mx-2 toggle-group mb-5" v-model="postsTabs" mandatory>
            <v-btn @click="updateSearch()" class="ma-1 toggle-btn toggle-btn-sm" color="#98FF86">All</v-btn>
            <v-btn @click="updateSearch()" class="ma-1 toggle-btn toggle-btn-sm" color="#98FF86">Public</v-btn>
            <v-btn @click="updateSearch()" class="ma-1 toggle-btn toggle-btn-sm" color="#98FF86">Friends</v-btn>
        </v-btn-toggle>
        <h2 v-if="posts.length === 0" class="text-center mt-5"><i>No posts found...</i></h2>
        <div v-else>
            <div v-if="postsTabs === 0">
                <v-list-item v-for="(post,index) in posts" :key="post.id">
                    <hr v-if="index > 0" style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
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
            <div v-else-if="postsTabs === 1">
                <v-list-item v-for="(post,index) in publicPosts" :key="post.id">
                    <hr v-if="index > 0" style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
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
            <div v-else>
                <v-list-item v-for="(post,index) in friendsPosts" :key="post.id">
                    <hr v-if="index > 0" style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
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
        </div>
    </div>
     
</template>
<style scoped>
.header-h1 {
    font-size: 2rem;
    color: rgb(152,255,134);
}
.custom-btn:hover {
    background-color: #98FF86;
    color: black !important;
    border-color: #98FF86;
}
.text-muted {
    color: grey;
}
.reply-text {
    color: rgb(207,255,218);
}
.toggle-group {
    border-radius: 10px !important;
    height: 100%;
    border: 3px solid #98FF86;
    width: calc(100% - 8px);
}
.toggle-group-2 {
    width: 100%;
}
.toggle-btn {
    width: calc(33.333333% - 8px);
    border-radius: 5px !important;
    height: 35px !important;
}
.toggle-btn-2 {
    width: calc(50% - 8px);
}
.toggle-btn-sm {
    height: 25px !important;
}
.hide-btn {
    color: rgb(152,255,134);
}
.new-post-div {
    border-top: 5px solid grey;
    background-color: #212121;
}
</style>
<script src="./js/Posts.js">
</script>