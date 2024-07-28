import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import Data from "../../data.json";

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
            fetch("http://"+Data.host+":5000/posts/"+this.username+"/"+category, {
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
                      else {
                        this.$emit('post-error',response.statusText);
                        return;
                      }
                }
                return response.json(); 
            })
            .then(data => {
              //console.log(data);
              if (data!==undefined && !data.message) {
                this.posts = data;
              }  
              this.loaded = true;
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.$emit('post-error',error);
                this.loaded = true;
            });
        },
        // api call to post
        post() {
            fetch("http://"+Data.host+":5000/posts/", {
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
                      else {
                        this.$emit('post-error',response.statusText);
                        return;
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
                this.$emit('post-error',error);
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
            fetch("http://"+Data.host+":5000/posts", {
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
                      else {
                        this.$emit('post-error',response.statusText);
                        return;
                      }
                }
                this.showReplyToPost = false;
                this.reply = '';
                this.getPosts(); 
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.$emit('post-error',error);
                this.showReplyToPost = false;
                this.reply = '';
                this.getPosts();
            });
        },
        //api call to like post
        like(post) {
            post.LikedPost ? post.Likes-- : post.Likes++;
            post.LikedPost = !post.LikedPost;
            fetch("http://"+Data.host+":5000/likes", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    postid: post.Id,
                    add: post.LikedPost ? true : false
                }) 
            })
            .then(response => {
                if (!response.ok) {
                    if(response.status === 401) {
                        //log out
                        this.$router.push('/');
                        this.resetStore();
                      }
                      else {
                        post.LikedPost ? post.Likes-- : post.Likes++;
                        post.LikedPost = !post.LikedPost;
                        this.$emit('post-error',response.statusText);
                        return;
                      }
                }
            })
            .catch(error => {
                post.LikedPost ? post.Likes-- : post.Likes++;
                post.LikedPost = !post.LikedPost;
                console.error('Error with Likes API:', error);
                this.$emit('post-error',error);
            });
        },
        //api call to delete post
        del(post) {
            fetch("http://"+Data.host+":5000/posts", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
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
                      else {
                        this.$emit('post-error',response.statusText);
                        return;
                      }
                }
                this.getPosts(); 
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.$emit('post-error',error);
                this.getPosts();
            });
        }
    },
    emits: ['post-error'],
    components: {
      
    },
};