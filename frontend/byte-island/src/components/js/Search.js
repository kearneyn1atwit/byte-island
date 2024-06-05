export default {
    data() {
        return {
            searchTab: 0,
            searchByTab: 0,
            searchFor: 'user',
            searchBy: 'name',
            search: '',
            filteredList: []
        }
    },
    async created() {
      
    },
    computed: {
      
    },
    mounted() {
        
    },
    methods: {
        getUsersNetworks(searchFor,searchBy,searchString) {
            // api call to get users/networks with search string
            this.filteredList = [];
            if(searchFor === 0) {
                // user by name
                if(searchBy === 0) {
                    for(let i=0;i<3;i++) {
                        this.filteredList.push({
                            name: searchString+' '+(i+1),
                            id: 'A56HlIJ'+i
                        });
                    }
                }
                // user by id
                else {
                    for(let i=0;i<5;i++) {
                        this.filteredList.push({
                            name: 'Generic_user_'+(i+1),
                            id: searchString+i
                        });
                    }
                }
            }
            else {
                // network by name
                if(searchBy === 0) {
                    for(let i=0;i<6;i++) {
                        this.filteredList.push({
                            name: searchString+' '+(i+1),
                            id: 'B99LMN1'+i
                        });
                    }
                }
                // network by id
                else {
                    for(let i=0;i<4;i++) {
                        this.filteredList.push({
                            name: 'Generic_network_'+(i+1),
                            id: searchString+i
                        });
                    }
                }
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
                this.searchBy = 'ID';
            }
            this.getUsersNetworks(this.searchTab,this.searchByTab,this.search);
        },
        //api call to handle friending user
        friend(user) {
            this.wip();
        },
        //api call to handle blocking user
        block(user) {
            this.wip();
        },
        //api call to handle joining network
        askToJoin(network) {
            this.wip();
        },
        wip() {
            alert("Feature not yet implemented.");
        }
    },
    components: {
      
    },
};