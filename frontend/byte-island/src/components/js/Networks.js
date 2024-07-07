import { mapGetters } from "vuex";

export default {
    data() {
        return {
            token: null,
            username: '',
            networkSearch: '',
            userSearch: '',
            showNewNetwork: false,
            newNetworkType: 0,
            newNetworkName: '',
            newNetworkDesc: '',
            newNetworkPic: '',
            networkVisited: false,
            userVisited: false,
            networks: [],
            viewedNetwork: null,
            networkUsers: [],
            visitedUser: null,
            usersProjects: [],
            usersPosts: [],
            usersData: 0,
            showReplyToPost: false,
            replyPost: null,
            reply: '',
            networksLoaded: false,
            usersLoaded: false,
            currentUserAdmin: false,
            userProjectsLoaded: false,
            userPostsLoaded: false
        }
    },
    async created() {
        
    },
    computed: {
        ...mapGetters(['getUsername','getToken']),
        filteredNetworks() {
            if(!this.networks) {
                return [];
            }
            if(!this.networkSearch) {
                return this.networks;
            }
            return this.networks.filter(network => {
                return network.name.toLowerCase().includes(this.networkSearch.toLowerCase()) 
            });
        },
        filteredUsers() {
            if(!this.networkUsers) {
                return [];
            }
            if(!this.userSearch) {
                return this.networkUsers;
            }
            return this.networkUsers.filter(user => {
                return user.username.toLowerCase().includes(this.userSearch.toLowerCase()) 
            });
        }
    },
    mounted() {
        this.getUserDetails();
        this.getNetworks();
    },
    methods: {
        getUserDetails() {
            this.token = this.getToken;
            this.username = this.getUsername;
        },
        //api call to get networks
        getNetworks() {
            this.networksLoaded = false;
            this.networks = [];
            fetch("http://localhost:5000/networks/2/"+this.username, {
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
                //console.log("Response was okay!");
                return response.json(); 
            })
            .then(data => {
                console.log(data);
                if(!data.message) {
                    this.networks = data;
                }
                this.networksLoaded = true;
            })
            .catch(error => {
                console.error('Error with Networks API:', error);
                this.networksLoaded = true;
            });
        },
        newNetwork() {
            this.showNewNetwork = true;
        },
        chooseNetworkPic() {
            this.$refs.networkPic.click();
            let self = this;
            document.getElementById('networkPic').addEventListener('change', function(e) {
                if (e.target.files[0]) {
                  var elem = document.createElement("img");
                  elem.setAttribute("height", "200");
                  elem.setAttribute("width", "200");
                  elem.setAttribute("alt", "Network Picture");
                  elem.style.border = '2px solid white';
                  elem.style.borderRadius = '1000px';
                  var reader = new FileReader();
                  reader.onload = function() {
                    elem.src = reader.result;
                  }
                  reader.readAsDataURL(e.target.files[0]);
                  document.getElementById("imagePrev").innerHTML = '';
                  document.getElementById("imagePrev").appendChild(elem);
                  self.newNetworkPic = e.target.files[0].name;
                }
            });
        },  
        //api call to handle network creation
        confirmCreation() {
            fetch("http://localhost:5000/networks", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    networkname: this.newNetworkName,
                    networkdescription: this.newNetworkDesc,
                    networkpicture: this.newNetworkPic,
                    private: this.newNetworkType === 0 ? false : true
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
                //console.log("Response was okay!");
                this.newNetworkType = 0;
                this.newNetworkName = '';
                this.newNetworkDesc = '';
                this.newNetworkPic = '';
                this.networksLoaded = false;
                this.getNetworks();
                this.showNewNetwork = false;
            })
            .catch(error => {
                console.error('Error with Networks API:', error);
                this.newNetworkType = 0;
                this.newNetworkName = '';
                this.newNetworkDesc = '';
                this.newNetworkPic = '';
                this.networksLoaded = false;
                this.getNetworks();
                this.showNewNetwork = false;
            });
        },
        view(network) {
            //api call to get users in network
            this.currentUserAdmin = false;
            this.viewedNetwork = network;
            this.networkSearch = '';
            this.networkVisited = true;
            this.usersLoaded = false;
            this.networkUsers = [];
            fetch("http://localhost:5000/users", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                  searchBy: 3,
                  searchString: network.networkname
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
                //console.log("Response was okay!");
                return response.json(); 
            })
            .then(data => {
                console.log(data);
                if(!data.message) {
                    this.networkUsers = data;
                    //find if user is admin of network
                    for(let i=0;i<data.length;i++) {
                        if(data[i].admin && data[i].username === this.username) {
                            this.currentUserAdmin = true;
                            break;
                        }
                    }
                }
                this.usersLoaded = true;
                
            })
            .catch(error => {
                console.error('Error with Users API:', error);
                this.usersLoaded = true;
            });
        },
        //api call to leave network
        leave(network,username) {
            fetch("http://localhost:5000/networks", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  network: network.networkname,
                  username: username
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
                //console.log("Response was okay!");
                this.$emit('network-left','Successfully left network: '+network.name+'.');
                this.networksLoaded = false;
                this.getNetworks(); 
            })
            .catch(error => {
                console.error('Error with Networks API:', error);
                // network error alert?
                this.networksLoaded = false;
                this.getNetworks(); 
            });
        },
        visit(user) {
            this.visitedUser = user;
            this.networkVisited = false;
            this.userVisited = true;
            this.$emit('visited-user',user);
            this.userSearch = '';
            this.getUsersProjects();
            this.getUsersPosts();
        },
        //api call to get users projects
        getUsersProjects() {
            this.userProjectsLoaded = false;
            this.usersProjects = [];
            fetch("http://localhost:5000/projects/"+this.visitedUser.username, {
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
                this.usersProjects = data;
              }  
              this.userProjectsLoaded = true;
            })
            .catch(error => {
                console.error('Error with Projects API:', error);
                this.userProjectsLoaded = true;
            });
        },
        //api call to get users posts
        getUsersPosts() {
            this.userPostsLoaded = false;
            this.usersPosts = [];
            let type = this.visitedUser.friend? 'all' : 'public'
            fetch("http://localhost:5000/posts/"+this.visitedUser.username+"/"+type, {
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
                this.usersPosts = data;
              }  
              this.userPostsLoaded = true;
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.userPostsLoaded = true;
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
                this.getUsersPosts(); 
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.showReplyToPost = false;
                this.reply = '';
                this.getUsersPosts();
            });
        },
        //api call to handle friending user
        friend(user) {
            fetch("http://localhost:5000/requests", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    type: 'user',
                    target: user.username
                }) 
            })
            .then(response => {
                if (!response.ok) {
                  if (response.status === 400) {
                    this.$emit('user-error','A friend request has already been sent to '+user.username+'!');
                    return;
                  }
                  else if(response.status === 401) {
                    //log out
                    this.$router.push('/');
                    this.resetStore();
                  }
                }
                //console.log("Response was okay!");
                this.$emit('friend-user','A friend request has been sent to '+user.username);
            })
            .catch(error => {
              console.error('Error with Requests API:', error);
            });
        },
        //api call to handle unfriending user
        unfriend(user) {
            fetch("http://localhost:5000/friends", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username1: this.username,
                  username2: user.username
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
                //console.log("Response was okay!");
                this.$emit('friend-user','Removed user from friend list: '+user.username+'.'); 
                this.view(this.viewedNetwork);
            })
            .catch(error => {
                console.error('Error with Users API:', error);
            });
        }
    },
    emits: ['network-left','visited-user','friend-user','user-error'],
    components: {
      
    },
};