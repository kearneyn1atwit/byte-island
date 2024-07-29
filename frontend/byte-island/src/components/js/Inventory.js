import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import Data from "../../data.json";

export default {
    data() {
        return {
            searchCategory: 'ALL',
            searchTab: 0,
            searchString: "",
            myBlock: null,
            itemList: [],
            pseudoDatabase: null
        };
    },
    async created() {
      
    },
    computed: {
        ...mapGetters(['getSelectedBlock','getUsername','getToken']),
    },
    async mounted() {
        this.setSelectedBlock(null);
        await this.fillDatabase();
    },
    methods: {
        ...mapMutations(['setSelectedBlock','setPoints','resetStore']),
      async fillDatabase() {
        this.getInv();
      },
      fetchDBItems() {
        try {
          return this.pseudoDatabase.slice(2,4);
        }catch(err) {
          this.getInv();
          return this.pseudoDatabase.slice(2,4);
        }
      },
      getSearchItems(searchCat,searchStr) {
        this.itemList = [];
        let fetchedItems=this.fetchDBItems();
        var myFunc;
        if(searchCat === 'ALL') myFunc = (x) => {return 1};
        else myFunc = (x) => {return x===(this.searchTab-1)};
        fetchedItems.forEach((element) => {
            if(element.Name.toLowerCase().indexOf(searchStr.toLowerCase())!=-1 && myFunc(element.Category)) this.itemList.push(element);
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
      },
      getColor(cat) {
        if(cat===0) return "#FF9095";
        else if(cat===1) return "#A3FFC9";
        else if(cat===2) return "#7DAEFF"; 
        else return "#DDDDDD";
      },
      mapCategory(cat) {
        if(cat===0) return "RED";
        else if(cat===1) return "GRN";
        else if(cat===2) return "BLU"; 
        else return "WHT";
      },
      mapNumToHex(id) {
        if(id === 'DEL' || id===null) return id;
        let hexID = (Number(id)*4).toString(32);
        if(hexID.length===1) hexID = '0'+hexID;
        return hexID;
    },
    mapHexToNum(hex) {
        if(hex===null || hex==='DEL') return hex;
        return Math.floor(parseInt(hex,32)/4);
    },
      selectBlock(fetchId) {
        let blockBtn = document.getElementById(fetchId);
        const id = this.mapHexToNum(fetchId.slice(0,fetchId.indexOf('-o')));
        if(this.myBlock === this.mapNumToHex(id)) {
            blockBtn.style.backgroundColor="white";
            this.myBlock = null;
            this.setSelectedBlock(null);
        } else {
            let idOnly = id;
            blockBtn.style.backgroundColor=this.getColor(this.pseudoDatabase[idOnly].Category);
            this.myBlock = this.mapNumToHex(id);
            this.setSelectedBlock(this.myBlock);
        }
      },
      currentBlock() {
        return this.myBlock;
      },
      getBg(id) {
        if(this.myBlock === this.mapNumToHex(id)) {
            return this.getColor(this.pseudoDatabase[Number(id)].Category);
        } else {
            return "white";
        }
      },
      selectDel() {
        let blockBtn = document.getElementById('DEL');
        if(this.myBlock === 'DEL') {
            blockBtn.style.backgroundColor="white";
            this.myBlock = null;
            this.setSelectedBlock(null);
        } else {
            blockBtn.style.backgroundColor="grey";
            this.myBlock = 'DEL';
            this.setSelectedBlock('DEL');
        }
      },
      delBg() {
        if(this.myBlock === 'DEL') {
            return "grey"; 
        } else {
            return "white";
        }
      },
      getInv() {
        fetch("http://"+Data.host+":5000/shop/"+this.getUsername+"/all", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': this.getToken
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
                    this.$emit('inventory-fetch-error',response.statusText);
                    return;
                  }
            }
            return response.json(); 
        })
        .then(data => {
            this.pseudoDatabase = data;
        })
        .catch(error => {
            console.error('Error with Inventory API:', error);
            this.$emit('inventory-fetch-error',error);
        });
    }
    },
    components: {

    },
  };