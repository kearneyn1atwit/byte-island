import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import Data from "../../data.json";

export default {
    data() {
        return {
            searchTab: 0,
            searchByTab: 0,
            searchFor: 'user',
            searchBy: 'name',
            search: '',
            filteredList: [],
            token: null,
            username: '',
            loaded: true
        }
    },
    async created() {
      
    },
    computed: {
        ...mapGetters(['getToken','getUsername'])
    },
    mounted() {
        this.getUserDetails();
    },
    methods: {
        ...mapMutations(['resetStore']),
        getUserDetails() {
            this.username = this.getUsername;
            this.token = this.getToken;
        },
        getUsersNetworks(searchFor,searchBy,searchString) {
            // api call to get users/networks with search string
            if(!searchString) {
                this.loaded = true;
                return;
            }
            const token = this.getToken;
            this.filteredList = [];
            this.loaded = false;
            if(searchFor === 0) {

                //API New Version
                fetch("http://"+Data.host+":5000/users", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', 
                        'Authorization': token
                    },
                    body: JSON.stringify({
                      searchBy: searchBy,
                      searchString: searchString
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
                    this.filteredList.length = 0;
                    if(data!==undefined && !data.message) {
                        data.forEach((row) => {
                            this.filteredList.push({
                                name: row.username,
                                pic: row.pfp
                            })
                        });
                    }
                    this.loaded = true;
                })
                .catch(error => {
                    console.error('Error with Users API:', error);
                    this.$emit('user-network-error',error);
                    this.loaded = true;
                });
            }
            else {
                
                if(!searchString) { //throws 404 falsely because it needs a non null value
                    return;
                }

                //API New Version
                fetch("http://"+Data.host+":5000/networks/"+searchBy+"/"+searchString, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json', 
                        'Authorization': token
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
                    this.filteredList.length = 0;
                    if(data!==undefined && !data.message) {
                        data.forEach((row) => {
                            this.filteredList.push({
                                name: row.networkname,
                                desc: row.networkdesc,
                                pic: row.pfp,
                                showDesc: false,
                                inNetwork: row.inNetwork
                            })
                        });
                    }
                    this.loaded = true;
                })
                .catch(error => {
                    console.error('Error with Users API:', error);
                    this.$emit('user-network-error',error);
                    this.loaded = true;
                });
            }
        },
        clearSearch() {
            this.search = '';
            this.filteredList = [];
        },
        updateSearch() {
            if(this.searchTab === 0) {
                this.searchFor = 'user';
            }
            else {
                this.searchFor = 'network';
            }
            if(this.searchByTab === 0) {
                this.searchBy = 'name';
            }
            else {
                this.searchBy = 'tag';
            }
            this.getUsersNetworks(this.searchTab,this.searchByTab,this.search);
        },
        //api call to handle friending user (/requests POST)
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
                    target: user.name
                }) 
            })
            .then(response => {
                if (!response.ok) {
                  if (response.status === 400) {
                    this.$emit('user-network-error','A friend request has already been sent to '+user.name+'!');
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
                this.$emit('user-network-success','A friend request has been sent to '+user.name);
            })
            .catch(error => {
              console.error('Error with Requests API:', error);
              this.$emit('user-network-error',error);
            });
        },
        //api call to handle joining network (/requests POST)
        askToJoin(network) {
            fetch("http://"+Data.host+":5000/requests", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    type: 'network',
                    target: network.name
                }) 
            })
            .then(response => {
                if (!response.ok) {
                  if (response.status === 400) {
                    this.$emit('user-network-error','You have already requested to join \"'+network.name+'\"!');
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
                this.$emit('user-network-success','A request to join network \"'+network.name+'\" has been successfully sent.');
            })
            .catch(error => {
              console.error('Error with Requests API:', error);
              this.$emit('user-network-error',error);
            });
        }
    },
    emits: ['user-network-success','user-network-error'],
    components: {
      
    },
};