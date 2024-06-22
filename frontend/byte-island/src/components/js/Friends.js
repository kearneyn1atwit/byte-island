export default {
    data() {
        return {
            friends: [],
            friendSearch: '',
            friendVisited: false,
            visitedFriend: null,
            friendsProjects: []
        }
    },
    async created() {
        
    },
    computed: {
        filteredFriends() {
            return this.friends.filter(friend => {
                return friend.username.toLowerCase().includes(this.friendSearch.toLowerCase()) 
            });
        }
    },
    mounted() {
        this.getFriends();
    },
    methods: {
        //api call to get list of friends
        getFriends() {
            this.friends = [];
            for(let i=0; i<10; i++) {
                this.friends.push({
                    id: i,
                    username: 'Xx_coolguy93'+i+'_xX',
                    pfp: 'http://placebeard.it/250/250',
                    points: [i+45,i,i+27],
                    // friend island data for visiting them
                    island: 'island image',
                    friendsSince: new Date(new Date().setDate(new Date().getDate() - (42 * i))).toISOString()
                });
            }
        },
        //api call to handle visiting friend
        visit(friend) {
            this.friendSearch = '';
            this.friendsProjects = [];
            // api call to get friends projects
            for(let i=0;i<8;i++) {
                this.friendsProjects.push({
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
            this.friendVisited = true;
            this.visitedFriend = friend;
            this.$emit('visited-friend',friend);
        },
        //api call to handle unfriending friend
        unfriend(friend) {
            this.$emit('unfriend-friend','Removed user from friend list: '+friend.username+'.');
            this.friends = this.friends.filter((item) => item !== friend);  
        }
    },
    components: {
      
    },
};