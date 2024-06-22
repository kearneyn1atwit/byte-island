export default {
    data() {
      return {
            searchCategory: 'all',
            searchTab: 0,
            searchString: '',
            itemList: []
        };
    },
    async created() {
      
    },
    computed: {

    },
    mounted() {
        
    },
    methods: {
        updateCategory() {
            let searchBar = document.getElementById("pointColorSearchGroup");
            if(this.searchTab === 0) {
                this.searchCategory = 'ALL';
                searchBar.style.borderColor = "#DDDDDD"; 
            } else if(this.searchTab === 1) {
                this.searchCategory = 'RED'
                searchBar.style.borderColor = "#FF9095"; 
            } else if(this.searchTab === 2) {
                this.searchCategory = 'GRN'
                searchBar.style.borderColor = "#A3FFC9"; 
            } else {
                this.searchCategory = 'BLU'
                searchBar.style.borderColor = "#7DAEFF"; 
            }
            
        },
        clearSearch() {
            this.searchString = '';
            this.itemList = [];
        }
    },
    components: {

    },
  };