import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

export default {
    data() {
        return {
            searchTab: 0,
            searchByTab: 0,
            searchFor: 'user',
            searchBy: 'name',
            search: '',
            filteredList: [],
            username: ''
        }
    },
    async created() {
      
    },
    computed: {
        ...mapGetters(['getToken','getUsername'])
    },
    mounted() {
        this.username = this.getUsername;
    },
    methods: {
        ...mapMutations(['setToken','resetStore']),
        getUsersNetworks(searchFor,searchBy,searchString) {
            // api call to get users/networks with search string
            const token = this.getToken;
            this.filteredList = [];

            if(searchFor === 0) {

                //API New Version
                fetch("http://localhost:5000/users", {
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
                    }
                    console.log("Response was okay!");
                    return response.json(); 
                })
                .then(data => {
                    this.filteredList.length = 0;
                    if(!data.message) {
                        data.forEach((row) => {
                            this.filteredList.push({
                                name: row.username,
                                pic: 'https://picsum.photos/id/'+(1000)+'/55/55'
                            })
                        });
                    }
                })
                .catch(error => {
                    console.error('Error with Users API:', error);
                });

                /*DEPRECATED*/

                // user by name
                // if(searchBy === 0) {
                //     for(let i=0;i<3;i++) {
                //         this.filteredList.push({
                //             name: searchString+' '+(i+1),
                //             pic: 'https://picsum.photos/id/'+(1000+i)+'/55/55'
                //         });
                //     }
                // }
                // // user by tags
                // else {
                //     for(let i=0;i<5;i++) {
                //         this.filteredList.push({
                //             name: 'Generic_user_'+(i+1),
                //             pic: 'https://picsum.photos/id/'+(1000+i)+'/55/55'
                //         });
                //     }
                // }
            }
            else {
                
                //API New Version
                fetch("http://localhost:5000/networks", {
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
                    }
                    console.log("Response was okay!");
                    return response.json(); 
                })
                .then(data => {
                    this.filteredList.length = 0;
                    if(!data.message) {
                        data.forEach((row) => {
                            this.filteredList.push({
                                name: row.networkname,
                                desc: "test description",//swap for networkdesc once added to db
                                pic: 'https://picsum.photos/id/'+(1000)+'/55/55'
                            })
                        });
                    }
                })
                .catch(error => {
                    console.error('Error with Users API:', error);
                });

                /*Deprecated*/
                
                // network by name
                // if(searchBy === 0) {
                //     for(let i=0;i<6;i++) {
                //         this.filteredList.push({
                //             name: searchString+' '+(i+1),
                //             desc: 'Description for network: '+searchString+' '+(i+1),
                //             pic: 'https://picsum.photos/id/'+(1000+i)+'/55/55'
                //         });
                //     }
                // }
                // // network by tags
                // else {
                //     for(let i=0;i<4;i++) {
                //         this.filteredList.push({
                //             name: 'Generic_network_'+(i+1),
                //             desc: 'Description for network: Generic_network_'+(i+1),
                //             pic: 'https://picsum.photos/id/'+(1000+i)+'/55/55'
                //         });
                //     }
                // }
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
        //api call to handle friending user
        friend(user) {
            this.$emit('user-network-success','A friend request has been sent to '+user.name);
        },
        //api call to handle joining network
        askToJoin(network) {
            this.$emit('user-network-success','A request to join network \"'+network.name+'\" has been successfully sent.');
        }
    },
    components: {
      
    },
};