export default {
    data() {
        return {
            postsTabs: 0,
            posts: [],
            newPost: ''
        }
    },
    async created() {
      
    },
    computed: {
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
        this.getPosts();
    },
    methods: {
        //api call to get all posts
        getPosts() {
            this.posts = [];
            for(let i=0;i<6;i++) {
                this.posts.push({
                    id: i,
                    type: i%3 === 0 ? 'public' : 'friends',
                    hideReplies: false,
                    datetime: new Date().toISOString(),
                    user: 'User'+i,
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
        updateSearch() {
            // reset hideReplies
            for(let i=0;i<6;i++) {
                this.posts[i].hideReplies = false;
            }
        },
        replyToPost(post) {
            this.wip();
        },
        wip() {
            alert('Work in progress.');
        }    
    },
    components: {
      
    },
};