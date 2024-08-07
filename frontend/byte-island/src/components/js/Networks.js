import { mapGetters } from "vuex";
import { mapMutations } from 'vuex';
import Data from "../../data.json";

export default {
    data() {
        return {
            base64Img: '',
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
            userPostsLoaded: false,
            showEditNetwork: false,
            editNetworkType: 0,
            editNetworkName: '',
            editNetworkDesc: '',
            editNetworkPic: '',
            editedNetwork: null,
            showDelNetwork: false,
            toDelNetwork: null,
            showLeaveNetwork: false,
            leaveNetwork: null,
            showDesc: false
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
                return network.networkname.toLowerCase().includes(this.networkSearch.toLowerCase()) 
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
        ...mapMutations(['resetStore']),
        getUserDetails() {
            this.token = this.getToken;
            this.username = this.getUsername;
        },
        //api call to get networks
        //edit, delete, delete dialog
        getNetworks() {
            this.networksLoaded = false;
            this.networks = [];
            fetch("http://"+Data.host+":5000/networks/2/"+this.username, {
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
                        this.$emit('user-network-error',response.statusText);
                        return;
                      }
                }
                //console.log("Response was okay!");
                return response.json(); 
            })
            .then(data => {
                //console.log(data);
                if(data!==undefined && !data.message) {
                    this.networks = data;
                }
                this.networksLoaded = true;
            })
            .catch(error => {
                console.error('Error with Networks API:', error);
                this.$emit('user-network-error',error);
                this.networksLoaded = true;
            });
        },
        newNetwork() {
            this.showNewNetwork = true;
        },
        chooseNetworkPic(type) {
            if(type === 'new') {
                this.$refs.networkPic.click();
                let self = this;
                document.getElementById('networkPic').addEventListener('change', function(e) {
                    if (e.target.files[0]) {
                      if(e.target.files[0].size > 10240) {
                        self.$emit('network-warning','File size limit is 10KB.');
                        return;
                      }
                      var elem = document.createElement("img");
                      elem.setAttribute("height", "200");
                      elem.setAttribute("width", "200");
                      elem.setAttribute("alt", "Network Picture");
                      elem.style.border = '2px solid white';
                      elem.style.borderRadius = '1000px';
                      var reader = new FileReader();
                      reader.onload = function() {
                        elem.src = reader.result;
                        self.base64Img = reader.result;
                      }
                      reader.readAsDataURL(e.target.files[0]);
                      document.getElementById("imagePrev").innerHTML = '';
                      document.getElementById("imagePrev").appendChild(elem);
                      self.newNetworkPic = e.target.files[0].name;
                    }
                });
            }
            else if(type === 'edit') {
                this.$refs.networkPicEdit.click();
                let self = this;
                document.getElementById('networkPicEdit').addEventListener('change', function(e) {
                    if (e.target.files[0]) {
                      if(e.target.files[0].size > 10240) {
                        self.$emit('network-warning','File size limit is 10KB.');
                        return;
                      }
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
                      document.getElementById("imagePrevEdit").innerHTML = '';
                      document.getElementById("imagePrevEdit").appendChild(elem);
                      self.editNetworkPic = e.target.files[0].name;
                    }
                });
            }
            
        },  
        //api call to handle network creation
        confirmCreation() {
            fetch("http://"+Data.host+":5000/networks", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    networkname: this.newNetworkName,
                    networkdescription: this.newNetworkDesc,
                    networkpicture: this.base64Img.substring(23),
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
                    else {
                        this.$emit('user-network-error',response.statusText);
                        return;
                    }
                }
                //console.log("Response was okay!");
                this.$emit('network-left','Successfully created network: '+this.newNetworkName);
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
                this.$emit('user-network-error',error);
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
            this.getNetworkUsers(network);
        },
        getNetworkUsers(network) {
            this.usersLoaded = false;
            this.networkUsers = [];
            fetch("http://"+Data.host+":5000/users", {
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
                      else {
                        this.$emit('user-network-error',response.statusText);
                        return;
                      }
                }
                //console.log("Response was okay!");
                return response.json(); 
            })
            .then(data => {
                // console.log(data);
                if(data!==undefined && !data.message) {
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
                this.$emit('user-network-error',error);
                this.usersLoaded = true;
            });
        },
        editNetwork(network) {
            this.showEditNetwork = true;
            this.editedNetwork = network;
            this.editNetworkType = network.private ? 1 : 0;
            this.editNetworkPic = network.pfp;
            // gonna have to show current image here somehow
            //
            var elem = document.createElement("img");
            elem.setAttribute("height", "200");
            elem.setAttribute("width", "200");
            elem.setAttribute("alt", "Network Picture");
            elem.style.border = '2px solid white';
            elem.style.borderRadius = '1000px';
            elem.setAttribute("src", 'data:image/jpg;base64,'+network.pfp);
            // need to figure out what to put here ^^^
            // timeout so div loads first
            setTimeout(function() {
                document.getElementById("imagePrevEdit").innerHTML = '';
                document.getElementById("imagePrevEdit").appendChild(elem);  
            },5);
            this.editNetworkName = network.networkname;
            this.editNetworkDesc = network.networkdesc;

        },
        //api call to edit network
        confirmEdit() {
            // console.log(this.editedNetwork);
            // console.log(this.editNetworkType === 0 ? false : true);

            alert('Feature not yet implemented.');


            // if(this.editedNetwork.networkname === this.editNetworkName && this.editedNetwork.networkdesc === this.editNetworkDesc && this.editedNetwork.private === (this.editNetworkType === 0 ? false : true)) {
            //     this.$emit('network-warning','No network details have been changed.');
            //     return;
            // }
            // this.$emit('network-left',this.editNetworkName+' has been successfully updated.');
            // this.showEditNetwork = false;
            // this.getNetworks();
        },
        delNetwork(network) {
            this.showDelNetwork = true;
            this.toDelNetwork = network;
        },
        //api call to delete network
        confirmDeleteNetwork(network) {
            fetch("http://"+Data.host+":5000/networks", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                  network: network.networkname
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
                        this.$emit('user-network-error',response.statusText);
                        return;
                      }
                }
                this.$emit('network-left',network.networkname+' has been successfully deleted.');
                this.showDelNetwork = false;
                this.getNetworks();
                //console.log("Response was okay!");
            })
            .catch(error => {
                console.error('Error with Networks API:', error);
                this.$emit('user-network-error',error);
                this.showDelNetwork = false;
                this.getNetworks();
            });
        },
        showLeave(network) {
            this.showLeaveNetwork = true;
            this.leaveNetwork = network;
        },
        //api call to leave network
        leave(network,username,reload) {
            fetch("http://"+Data.host+":5000/networks", {
                method: 'PUT',
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
                    else {
                        this.$emit('user-network-error',response.statusText);
                        return;
                    }
                }
                //console.log("Response was okay!");
                if(reload === 'networks') {
                    this.showLeaveNetwork = false;
                    this.$emit('network-left','Successfully left network: '+network.networkname+'.');
                    this.getNetworks(); 
                }
                else {
                    this.$emit('network-left',username+' is no longer part of this network.');
                    this.getNetworkUsers(network);
                }
            })
            .catch(error => {
                console.error('Error with Networks API:', error);
                this.$emit('user-network-error',error);
                // network error alert?
                if(reload === 'networks') {
                    this.networksLoaded = false;
                    this.getNetworks(); 
                }
                else {
                    this.usersLoaded = false;
                    this.getNetworkUsers(network); 
                }
                
            });
        },
        visit(user) {
            this.visitedUser = user;
            this.networkVisited = false;
            this.showDesc = false;
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
            fetch("http://"+Data.host+":5000/projects/"+this.visitedUser.username, {
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
                        this.$emit('user-network-error',response.statusText);
                        return;
                      }
                }
                return response.json(); 
            })
            .then(data => {
              if (data!==undefined && !data.message) {
                this.usersProjects = data;
              }  
              this.userProjectsLoaded = true;
            })
            .catch(error => {
                console.error('Error with Projects API:', error);
                this.$emit('user-network-error',error);
                this.userProjectsLoaded = true;
            });
        },
        //api call to get users posts
        getUsersPosts() {
            this.userPostsLoaded = false;
            this.usersPosts = [];
            let type = this.visitedUser.friend? 'all' : 'public'
            fetch("http://"+Data.host+":5000/posts/"+this.visitedUser.username+"/"+type, {
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
                        this.$emit('user-network-error',response.statusText);
                        return;
                      }
                }
                return response.json(); 
            })
            .then(data => {
              if (data!==undefined && !data.message) {
                this.usersPosts = data;
              }  
              this.userPostsLoaded = true;
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.$emit('user-network-error',error);
                this.userPostsLoaded = true;
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
                        this.$emit('user-network-error',response.statusText);
                        return;
                      }
                }
            })
            .catch(error => {
                post.LikedPost ? post.Likes-- : post.Likes++;
                post.LikedPost = !post.LikedPost;
                console.error('Error with Likes API:', error);
                this.$emit('user-network-error',error);
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
                        this.$emit('user-network-error',response.statusText);
                        return;
                      }
                }
                this.showReplyToPost = false;
                this.reply = '';
                this.getUsersPosts(); 
            })
            .catch(error => {
                console.error('Error with Posts API:', error);
                this.$emit('user-network-error',error);
                this.showReplyToPost = false;
                this.reply = '';
                this.getUsersPosts();
            });
        },
        //api call to handle friending user
        friend(user) {
            fetch("http://"+Data.host+":5000/requests", {
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
                    this.$emit('user-network-error','A friend request has already been sent to '+user.username+'!');
                    return;
                  }
                  else if(response.status === 401) {
                    //log out
                    this.$router.push('/');
                    this.resetStore();
                  }
                  else {
                    this.$emit('user-network-error',response.statusText);
                    return;
                  }
                }
                //console.log("Response was okay!");
                this.$emit('friend-user','A friend request has been sent to '+user.username);
            })
            .catch(error => {
              console.error('Error with Requests API:', error);
              this.$emit('user-network-error',error);
            });
        },
        //api call to handle unfriending user
        unfriend(user) {
            fetch("http://"+Data.host+":5000/friends", {
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
                    else {
                        this.$emit('user-network-error',response.statusText);
                        return;
                    }
                }
                //console.log("Response was okay!");
                this.$emit('friend-user','Removed user from friend list: '+user.username+'.'); 
                this.view(this.viewedNetwork);
            })
            .catch(error => {
                console.error('Error with Users API:', error);
                this.$emit('user-network-error',error);
            });
        },
        //api call to make user admin
        admin(user,network) {
            fetch("http://"+Data.host+":5000/admin", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                  network: network.networkname,
                  target: user.username,
                  add: true
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
                        this.$emit('user-network-error',response.statusText);
                        return;
                    }
                }
                //console.log("Response was okay!");
                this.$emit('friend-user',user.username+' is now an admin of '+network.networkname+'.'); 
                this.view(this.viewedNetwork);
            })
            .catch(error => {
                console.error('Error with Admin API:', error);
                this.$emit('user-network-error',error);
            });
        },
        //api call to remove user admin
        unadmin(user,network) {
            fetch("http://"+Data.host+":5000/admin", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                  network: network.networkname,
                  target: user.username,
                  add: false
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
                        this.$emit('user-network-error',response.statusText);
                        return;
                    }
                }
                //console.log("Response was okay!");
                this.$emit('friend-user',user.username+' is no longer an admin of '+network.networkname+'.'); 
                this.view(this.viewedNetwork);
            })
            .catch(error => {
                console.error('Error with Admin API:', error);
                this.$emit('user-network-error',error);
            });
        }
    },
    emits: ['network-warning','network-left','visited-user','friend-user','user-network-error'],
    components: {
      
    },
};