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
            if(type2 === 0) {
                // open user
                if(type === 0) {
                    fetch("http://localhost:5000/requests/"+this.username+"/user/open", {
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
                        this.requests = data;
                      }
                      this.loaded = true;
                    })
                    .catch(error => {
                      this.loaded = true;
                      console.error('Error with Requests API:', error);
                    });
                } 
                // open network
                else {
                    fetch("http://localhost:5000/requests/"+this.username+"/network/open", {
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
                        this.requests = data;
                      }
                      this.loaded = true;
                    })
                    .catch(error => {
                      this.loaded = true;
                      console.error('Error with Requests API:', error);
                    });
                }
            } 
            else {
                // pending user
                if(type === 0) {
                    fetch("http://localhost:5000/requests/"+this.username+"/user/pending", {
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
                        this.requests = data;
                      }
                      this.loaded = true;
                    })
                    .catch(error => {
                      this.loaded = true;
                      console.error('Error with Requests API:', error);
                    });
                } 
                // pending network
                else {
                    fetch("http://localhost:5000/requests/"+this.username+"/network/pending", {
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
                        this.requests = data;
                      }
                      this.loaded = true;
                    })
                    .catch(error => {
                      this.loaded = true;
                      console.error('Error with Requests API:', error);
                    });
                }
            }
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
                if (!response.ok) {
                  if(response.status === 401) {
                    //log out
                    this.$router.push('/');
                    this.resetStore();
                  }
                }
                //console.log("Response was okay!");
                console.log(response);
                this.$emit('request-success',request.AcceptMessage);
                this.$emit('get-requests');
                this.getRequests(this.searchTab,this.searchTab2);
            })
            .catch(error => {
              console.error('Error with Requests API:', error);
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
                }
                //console.log("Response was okay!");
                console.log(response);
                this.$emit('get-requests');
                this.getRequests(this.searchTab,this.searchTab2);  
            })
            .catch(error => {
              console.error('Error with Requests API:', error);
            });
        }
    },
    emits: ['request-success','get-requests'],
    components: {
      
    },
  };