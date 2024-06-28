export default {
    data() {
        return {
            networkSearch: '',
            userSearch: '',
            networkVisited: false,
            userVisited: false,
            networks: [],
            viewedNetwork: null,
            networkUsers: [],
            visitedUser: null,
            userProjects: []
        }
    },
    async created() {
        
    },
    computed: {
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
        this.getNetworks();
    },
    methods: {
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
            this.userSearch = '';
            this.userProjects = [];
            // api call to get users projects
            for(let i=0;i<8;i++) {
                this.userProjects.push({
                    id: i,
                    due: new Date().toISOString(),
                    points: [i+4,i,i+12],
                    title: "Friend project "+(i+1),
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
            this.visitedUser = user;
            this.networkVisited = false;
            this.userVisited = true;
            this.$emit('visited-user',user);
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