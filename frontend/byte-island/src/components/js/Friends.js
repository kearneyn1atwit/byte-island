import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

export default {
    data() {
        return {
            token: null,
            username: '',
            friends: [],
            friendSearch: '',
            friendVisited: false,
            visitedFriend: null,
            friendsProjects: [],
            friendsPosts: [],
            friendsData: 0,
            showReplyToPost: false,
            replyPost: null,
            reply: '',
            loaded: false,
            friendProjectsLoaded: false,
            friendPostsLoaded: false
        }
    },
    async created() {
        
    },
    computed: {
        ...mapGetters(['getUsername','getToken']),
        filteredFriends() {
            if(!this.friends) {
                return [];
            }
            if(!this.friendSearch) {
                return this.friends;
            }
            return this.friends.filter(friend => {
                return friend.username.toLowerCase().includes(this.friendSearch.toLowerCase()) 
            });
        }
    },
    mounted() {
        this.getUserDetails();
        this.getFriends();
    },
    methods: {
        ...mapMutations(['resetStore']),
        getUserDetails() {
            this.token = this.getToken;
            this.username = this.getUsername;
        },
        //api call to get list of friends
        getFriends() {
            this.friends = [];
            fetch("http://localhost:5000/users", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  searchBy: 2,
                  searchString: this.username
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
                        this.$emit('friend-error',response.statusText);
                        return;
                      }
                }
                //console.log("Response was okay!");
                return response.json(); 
            })
            .then(data => {
                if(!data.message) {
                    this.friends = data;
                }
                this.loaded = true;
            })
            .catch(error => {
                console.error('Error with Users API:', error);
                this.$emit('friend-error',error);
                this.loaded = true;
            });
        },
        //api call to handle visiting friend
        visit(friend) {
            this.friendVisited = true;
            this.visitedFriend = friend;
            this.$emit('visited-friend',friend);
            this.friendSearch = '';
            this.getFriendsProjects();
            this.getFriendsPosts();
        },
        // api call to get friends projects
        getFriendsProjects() {
            this.friendProjectsLoaded = false;
            this.friendsProjects = [];
            fetch("http://localhost:5000/projects/"+this.visitedFriend.username, {
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
                        this.$emit('friend-error',response.statusText);
                        return;
                      }
                }
                return response.json(); 
            })
            .then(data => {
              if (!data.message) {
                this.friendsProjects = data;
              }  
              this.friendProjectsLoaded = true;
            })
            .catch(error => {
                console.error('Error with Projects API:', error);
                this.$emit('friend-error',error);
                this.friendProjectsLoaded = true;
            });
        },
        // api call to get friends posts
        getFriendsPosts() {
            this.friendPostsLoaded = false;
            this.friendsPosts = [];
            fetch("http://localhost:5000/posts/"+this.visitedFriend.username+"/all", {
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
                        this.$emit('friend-error',response.statusText);
                        return;
                      }
                }
                return response.json(); 
            })
            .then(data => {
                // console.log(data);
              if (!data.message) {
                this.friendsPosts = data;
              }  
              this.friendPostsLoaded = true;
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.$emit('friend-error',error);
                this.friendPostsLoaded = true;
            });
        },
        //api call to like post
        like(post) {
            fetch("http://localhost:5000/likes", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: post.User,
                    postid: post.Id,
                    add: post.LikedPost ? false : true
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
                        this.$emit('friend-error',response.statusText);
                        return;
                      }
                }
                post.LikedPost ? post.Likes-- : post.Likes++;
                post.LikedPost = !post.LikedPost;
            })
            .catch(error => {
                console.error('Error with Likes API:', error);
                this.$emit('friend-error',error);
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
                      else {
                        this.$emit('friend-error',response.statusText);
                        return;
                      }
                }
                this.showReplyToPost = false;
                this.reply = '';
                this.getFriendsPosts(); 
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.$emit('friend-error',error);
                this.showReplyToPost = false;
                this.reply = '';
                this.getFriendsPosts();
            });
        },
        //api call to handle unfriending friend
        unfriend(friend) {
            fetch("http://localhost:5000/friends", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username1: this.username,
                  username2: friend.username
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
                        this.$emit('friend-error',response.statusText);
                        return;
                      }
                }
                //console.log("Response was okay!");
                this.$emit('unfriend-friend','Removed user from friend list: '+friend.username+'.'); 
                this.loaded = false;
                this.getFriends();
            })
            .catch(error => {
                console.error('Error with Users API:', error);
                this.$emit('friend-error',error);
            });
        }
    },
    emits: ['visited-friend','unfriend-friend','friend-error'],
    components: {
      
    },
};