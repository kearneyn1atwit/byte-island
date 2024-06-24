<template>
    <div>
        <h1 class="header-h1 ml-2 my-0">My Posts</h1>
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
                            <pre><b>{{post.user}}</b>: {{post.text}}</pre>
                            <div v-if="!post.hideReplies">
                                <div class="ml-10 my-7" v-for="reply in post.replies" :key="reply.id" >
                                    <pre class="reply-text">{{reply.datetime}}</pre>
                                    <pre class="reply-text"><b>{{reply.user}}</b>: {{reply.text}}</pre>
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
                            <pre><b>{{post.user}}</b>: {{post.text}}</pre>
                            <div v-if="!post.hideReplies">
                                <div class="ml-10 my-7" v-for="reply in post.replies" :key="reply.id" >
                                    <pre class="reply-text">{{reply.datetime}}</pre>
                                    <pre class="reply-text"><b>{{reply.user}}</b>: {{reply.text}}</pre>
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
                            <pre><b>{{post.user}}</b>: {{post.text}}</pre>
                            <div v-if="!post.hideReplies">
                                <div class="ml-10 my-7" v-for="reply in post.replies" :key="reply.id" >
                                    <pre class="reply-text">{{reply.datetime}}</pre>
                                    <pre class="reply-text"><b>{{reply.user}}</b>: {{reply.text}}</pre>
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
        <!-- <div style="position: sticky; bottom: 0;" class="new-post-div mx-n3">
            <v-row class="mx-5 mt-5">
                <v-text-field v-model="newPost" variant="outlined" placeholder="Enter message..." bg-color="white" class="ital-input mb-2 mr-3"></v-text-field>
                <v-btn variant="outlined" size="large" style="margin-top: 6px;">Post</v-btn>
            </v-row>
        </div>  -->
    </div>
</template>
<style scoped>
.header-h1 {
    font-size: 2rem;
    color: rgb(152,255,134);
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
.toggle-btn {
    width: calc(33.333333% - 8px);
    border-radius: 5px !important;
    height: 35px !important;
}
.toggle-btn-sm {
    height: 25px !important;
}
.hide-btn {
    color: rgb(152,255,134);
}
.new-post-div {
    border-top: 5px solid grey;
}
</style>
<script src="./js/Posts.js">
</script>