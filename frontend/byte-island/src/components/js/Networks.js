import { mapGetters } from "vuex";

export default {
    data() {
        return {
            token: null,
            username: '',
            networkSearch: '',
            userSearch: '',
            showNewNetwork: false,
            newNetworkName: '',
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
            for(let i=0;i<10;i++) {
                this.networks.push({
                    id: i,
                    name: 'generic_network_'+(i+1),
                    pfp: 'https://picsum.photos/id/'+(i+500)+'/55/55',
                });
            }
        },
        newNetwork() {
            this.showNewNetwork = true;
        },
        chooseNetworkPic() {
            this.$refs.networkPic.click();
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
                  // i guess this does *actually* nothing for some reason? cool
                  // this.newNetworkPic = e.target.files[0].name;
                }
            });
        },  
        //api call to handle network creation
        confirmCreation() {
            if(document.getElementById('networkPic').files.length === 0) {
                this.$emit('network-warning','Please select a network image.');
            }
            else {
                this.newNetworkName = '';
                this.newNetworkPic = '';
                // this.getNetworks();
                this.showNewNetwork = false;
            }
        },
        view(network) {
            //api call to get users in network
            this.networkUsers = [];
            for(let i=network.id;i<network.id+8;i++) {
                this.networkUsers.push({
                    id: i,
                    username: 'User_'+i,
                    pfp: 'http://placebeard.it/250/250',
                    points: [i+33,i+100,i+2],
                    // friend island data for visiting them
                    island: 'island image',
                    //check if user is current user's friend
                    friend: i%2 === 0 ? true : false,
                    friendsSince: i%2 === 0 ? new Date(new Date().setDate(new Date().getDate() - (42 * i))).toISOString() : '',
                    admin: i <= network.id+2 ? true : false
                });
            }
            this.viewedNetwork = network;
            this.networkSearch = '';
            this.networkVisited = true;
        },
        //api call to leave network
        leave(network) {
            this.$emit('network-left','Successfully left network: '+network.name+'.');
            this.networks = this.networks.filter((item) => item !== network);  
        },
        //api call to handle visiting user
        visit(user) {
            this.visitedUser = user;
            this.networkVisited = false;
            this.userVisited = true;
            this.$emit('visited-user',user);
            this.userSearch = '';
            this.userProjects = [];
            // api call to get users projects
            for(let i=0;i<8;i++) {
                this.userProjects.push({
                    id: i,
                    due: new Date().toISOString(),
                    points: [i+4,i,i+12],
                    title: "User project "+(i+1),
                    desc: 'Project description for friend project '+(i+1),
                    updates: [
                        {
                            id: i,
                            name: 'First update',
                            date: new Date().toISOString(),
                            desc: 'This is update '+(3*i+1)+'.'
                        },
                        {
                            id: i+1,
                            name: 'Update #2',
                            date: new Date().toISOString(),
                            desc: 'Update 2 here. And I have to admit, this is quite a long update description, let\'s see if it looks good on the website?'
                        }
                    ],
                    completed: i%2 === 0 ? 'incomplete' : new Date().toISOString()
                });
            }
            this.getUsersPosts();
        },
        //api call to get users posts
        getUsersPosts() {
            this.usersPosts = [];
            for(let i=0;i<4;i++) {
                this.usersPosts.push({
                    id: i,
                    type: 'public',
                    hideReplies: false,
                    datetime: new Date().toISOString(),
                    user: this.visitedUser.username,
                    text: 'This is a public post '+(i+1),
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
            // this.getUsersPosts();
        },
        resetHideReplies() {
            for(let i=0;i<this.usersPosts.length;i++) {
                this.usersPosts[i].hideReplies = false;
            }
        },
        //api call to handle friending user
        friend(user) {
            this.$emit('friend-user','A friend request has been sent to '+user.username);
        },
        //api call to handle unfriending user
        unfriend(user) {
            this.$emit('friend-user','Removed user from friend list: '+user.username+'.');
            user.friend = false;
        }
    },
    components: {
      
    },
};