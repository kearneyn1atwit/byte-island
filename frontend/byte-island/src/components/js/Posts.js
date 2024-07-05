import { mapGetters } from "vuex";

export default {
    data() {
        return {
            postsTabs: 0,
            posts: [],
            newPost: '',
            newPostTab: 0,
            showNewPost: false,
            showReplyToPost: false,
            replyPost: null,
            reply: '',
            token: null,
            username: ''
        }
    },
    async created() {
      
    },
    computed: {
        ...mapGetters(['getToken','getUsername']),
        publicPosts() {
            if(!this.posts) {
                return []
            }
            return this.posts.filter(post => {
                return post.type === 'public' 
            });
        },
        friendsPosts() {
            if(!this.posts) {
                return []
            }
            return this.posts.filter(post => {
                return post.type === 'friends' 
            });
        }
    },
    mounted() {
        this.getUserDetails();
        this.getPosts();
    },
    methods: {
        getUserDetails() {
            this.token = this.getToken;
            this.username = this.getUsername;
        },
        //api call to get all posts
        getPosts() {
            this.posts = [];
            for(let i=0;i<6;i++) {
                this.posts.push({
                    id: i,
                    type: i%3 === 0 ? 'public' : 'friends',
                    hideReplies: false,
                    datetime: new Date().toISOString(),
                    user: this.username,
                    text: i%3 === 0 ? 'This is a public post '+(i+1) : 'This is a friend post '+(i+1),
                    replies: i%2 === 0 ? [] : [
                        {
                            id: 0,
                            datetime: new Date().toISOString(),
                            user: 'DifferentUser'+(i+5),
                            text: 'This is a reply to the post '+(i+1)
                        },
                        {
                            id: 1,
                            datetime: new Date().toISOString(),
                            user: 'AnotherUser'+(i+54),
                            text: 'This is a different response to this post'
                        }
                    ]
                });
            }
        },
        // api call to post
        post() {
            this.showNewPost = false;
            this.newPostTab = 0;
            //this.getPosts();
            this.newPost = '';
        },
        updateSearch() {
            // actually call api to get posts here
            // reset hideReplies
            for(let i=0;i<6;i++) {
                this.posts[i].hideReplies = false;
            }
        },
        replyToPost(post) {
            this.replyPost = post;
            this.showReplyToPost = true;
        },
        // api call to reply to post
        confirmReply(post) {
            post.replies.push({
                id: post.replies.length,
                datetime: new Date().toISOString(),
                user: this.username,
                text: this.reply
            });
            this.showReplyToPost = false;
            this.reply = '';
            // this.getPosts();
        }
    },
    components: {
      
    },
};