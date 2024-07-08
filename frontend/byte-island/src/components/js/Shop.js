import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

export default {
    data() {
      return {
            searchCategory: 'ALL',
            searchTab: 0,
            searchString: "",
            itemList: [],
            pseudoDatabase: [
                {
                    id: "000",
                    name: "nil",
                    RGB: 1,
                    image: "/000.png",
                    inventory: 0
                },
                {
                    id: "001",
                    name: "air",
                    RGB: 1,
                    image: "/001.png",
                    inventory: 0
                },
                {
                    id: "002",
                    name: "simple block",
                    RGB: 10000,
                    image: "/002.png",
                    inventory: 0
                },
                {
                    id: "003",
                    name: "blue block",
                    RGB: 1,
                    image: "/003.png",
                    inventory: 0
                },
                {
                    id: "004",
                    name: "green block",
                    RGB: 100,
                    image: "/004.png",
                    inventory: 0
                }]
        };
    },
    created() {
        
    },
    computed: {
        
    },
    mounted() {
        
    },
    methods: {
        fetchDBItems() {
            return this.pseudoDatabase.slice(2);
        },
        setInv(id,inv) {
            this.pseudoDatabase[Number(id)].inventory++;
        },
        getSearchItems(searchCat,searchStr) {
            this.itemList = [];
            let fetchedItems=this.fetchDBItems();
            var myFunc;
            if(searchCat === 'ALL') myFunc = (x) => {return 1};
            else if(searchCat === 'RED') myFunc = (x) => {return x/10000>=1};
            else if(searchCat === 'GRN') myFunc = (x) => {return x/100%100>=1};
            else myFunc = (x) => {return x%100>=1};
            fetchedItems.forEach((element) => {
                if(element.name.indexOf(searchStr.toLowerCase())!=-1 && myFunc(element.RGB)) this.itemList.push(element);
            });
        },
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
            this.getSearchItems(this.searchCategory,this.searchString);
        },
        clearSearch() {
            this.searchString = '';
            this.itemList = [];
        }
    },
    components: {

    },
  };