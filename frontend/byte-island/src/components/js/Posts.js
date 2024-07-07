import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

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
            username: '',
            loaded: false
        }
    },
    async created() {
      
    },
    computed: {
        ...mapGetters(['getToken','getUsername'])
    },
    mounted() {
        this.getUserDetails();
        this.getPosts();
    },
    methods: {
        ...mapMutations(['resetStore']),
        getUserDetails() {
            this.token = this.getToken;
            this.username = this.getUsername;
        },
        //api call to get all posts
        getPosts() {
            this.loaded = false;
            this.posts = [];
            let category = 'all';
            if(this.postsTabs === 1) {
                category = 'public';
            }
            else if(this.postsTabs === 2) {
                category = 'friends';
            }
            fetch("http://localhost:5000/posts/"+this.username+"/"+category, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                }
            })
            .then(response => {
                if (!response.ok) {
                    if(response.status === 401) {
                        //log out
                        this.$router.push('/');
                        this.resetStore();
                      }
                }
                return response.json(); 
            })
            .then(data => {
              if (!data.message) {
                this.posts = data;
              }  
              this.loaded = true;
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.loaded = true;
            });
        },
        // api call to post
        post() {
            fetch("http://localhost:5000/posts/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    type: this.newPostTab === 0 ? 'public' : 'friends',
                    text: this.newPost
                }) 
            })
            .then(response => {
                if (!response.ok) {
                    if(response.status === 401) {
                        //log out
                        this.$router.push('/');
                        this.resetStore();
                      }
                }
                this.showNewPost = false;
                this.loaded = false;
                this.getPosts();
                this.newPostTab = 0;
                this.newPost = '';
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.showNewPost = false;
                this.loaded = false;
                this.getPosts();
                this.newPostTab = 0;
                this.newPost = '';
            });
        },
        replyToPost(post) {
            this.replyPost = post;
            this.showReplyToPost = true;
        },
        // api call to reply to post
        confirmReply(post) {
            fetch("http://localhost:5000/posts", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    text: this.reply,
                    postid: post.Id
                }) 
            })
            .then(response => {
                if (!response.ok) {
                    if(response.status === 401) {
                        //log out
                        this.$router.push('/');
                        this.resetStore();
                      }
                }
                this.showReplyToPost = false;
                this.reply = '';
                this.getPosts(); 
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.showReplyToPost = false;
                this.reply = '';
                this.getPosts();
            });
        }
    },
    components: {
      
    },
};