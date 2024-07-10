import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

export default {
    props: ['requestCount'],
    data() {
      return {
        username: '',
        token: null,
        searchTab: 0,
        searchTab2: 0,
        requests: [],
        loaded: false
      };
    },
    async created() {
      
    },
    computed: {
        ...mapGetters(['getToken','getUsername']),
    },
    mounted() {
        this.getUserDetails();
        this.getRequests(this.searchTab,this.searchTab2);
    },
    methods: {
        ...mapMutations(['resetStore']),
        getUserDetails() {
            this.token = this.getToken;
            this.username = this.getUsername;
        },
        // api call to get user requests
        getRequests(type,type2) {
            this.loaded = false;
            this.requests = [];
            let reqType = '/user/open';
            if(type === 1 && type2 === 0) {
              reqType = '/network/open';
            }
            else if(type === 0 && type2 === 1) {
              reqType = '/user/pending';
            }
            else if(type === 1 && type2 === 1) {
              reqType = '/network/pending';
            }
            fetch("http://localhost:5000/requests/"+this.username+reqType, {
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
                      this.$emit('request-error',response.statusText);
                      return;
                    }
                }
                //console.log("Response was okay!");
                return response.json(); 
            })
            .then(data => {
                if(!data.message) {
                    this.requests = data;
                }
                this.loaded = true;
            })
            .catch(error => {
                this.loaded = true;
                console.error('Error with Requests API:', error);
                this.$emit('request-error',error);
            });
        },
        accept(request) {
            // api call to accept request (PUT)
            fetch("http://localhost:5000/requests/", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    requestid: request.Id
                  }) 
            })
            .then(response => {
              // console.log(response);
                if (!response.ok) {
                  if(response.status === 401) {
                    //log out
                    this.$router.push('/');
                    this.resetStore();
                  }
                  else {
                    this.$emit('request-error',response.statusText);
                    return;
                  }
                }
                //console.log("Response was okay!");
                this.$emit('request-success',request.AcceptMessage);
                this.$emit('get-requests');
                this.getRequests(this.searchTab,this.searchTab2);
            })
            .catch(error => {
              console.error('Error with Requests API:', error);
              this.$emit('request-error',error);
            });
        },
        ignore(request) {
            // api call to remove request (DELETE)
            fetch("http://localhost:5000/requests/", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    requestid: request.Id
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
                    this.$emit('request-error',response.statusText);
                    return;
                  }
                }
                //console.log("Response was okay!");
                this.$emit('get-requests');
                this.getRequests(this.searchTab,this.searchTab2);  
            })
            .catch(error => {
              console.error('Error with Requests API:', error);
              this.$emit('request-error',error);
            });
        }
    },
    emits: ['request-success','request-error','get-requests'],
    components: {
      
    },
  };