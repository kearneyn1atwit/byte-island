export default {
    data() {
        return {
            friends: []
        }
    },
    async created() {
      
    },
    computed: {
      
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
                    pfp: 'http://placebeard.it/250/250'
                });
            }
        },
        //api call to handle friending user
        visit(friend) {

            this.wip();
        },
        //api call to handle joining network
        unfriend(friend) {
            this.$emit('unfriend-friend','Removed user from friend list: '+friend.username+'.');
            this.friends = this.friends.filter((item) => item !== friend);  
        },
        wip() {
            alert("Feature not yet implemented.");
        }
    },
    components: {
      
    },
};