export default {
    props: ['requestCount'],
    data() {
      return {
        searchTab: 0,
        friendRequests: 0,
        networkRequests: 0,
        requests: []
      };
    },
    async created() {
      
    },
    computed: {
      
    },
    mounted() {
        this.getRequests(this.searchTab);
    },
    methods: {
        // api call to get user requests
        getRequests(type) {
            this.requests = [];
            this.friendRequests = this.requestCount;
            this.networkRequests = 0;
            //friends
            if(type === 0) {
                for(let i=0;i<this.friendRequests;i++) {
                    this.requests.push({
                        id: i,
                        message: 'User '+i+' sent a friend request',
                        datetime: new Date().toISOString(),
                        acceptMessage: 'Friend request accepted!'
                    })
                }
            }
            //networks
            else {
                for(let i=0;i<this.networkRequests;i++) {
                    this.requests.push({
                        id: i,
                        message: 'User '+i+' wants to join your network: Network '+(i+1),
                        datetime: new Date().toISOString(),
                        acceptMessage: 'User '+i+' has now joined your network: Network '+(i+1)+'!'
                    })
                }
            }
        },
        accept(request) {
            // api call to accept request
            this.ignore(request);
            this.$emit('request-success',request.acceptMessage);
        },
        ignore(request) {
            // api call to remove request
            this.$emit('remove-request');
            this.requests = this.requests.filter((item) => item !== request);  
        }
    },
    components: {
      
    },
  };