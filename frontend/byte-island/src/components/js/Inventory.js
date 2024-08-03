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
        document.addEventListener("click",this.maybeGetInv);
    },
    methods: {
        ...mapMutations(['setSelectedBlock','setPoints','resetStore']),
      async fillDatabase() {
        this.getInv();
      },
      fetchDBItems() {
        try {
          //Return what blocks are implemented from the DB
          return this.pseudoDatabase.slice(2,5).concat(this.pseudoDatabase.slice(6,8).concat(this.pseudoDatabase.slice(24,25).concat(this.pseudoDatabase.slice(40,41).concat(this.pseudoDatabase.slice(51,52).concat(this.pseudoDatabase.slice(72,74))))));
        }catch(err) {
          this.getInv();
          return this.pseudoDatabase.slice(2,5).concat(this.pseudoDatabase.slice(6,8).concat(this.pseudoDatabase.slice(24,25).concat(this.pseudoDatabase.slice(40,41).concat(this.pseudoDatabase.slice(51,52).concat(this.pseudoDatabase.slice(72,74))))));
        }
      },
      //Try to fetch inventory counts for inventory display.
      maybeGetInv() {
        if(this.getSelectedBlock) {
          //if(this.getSelectedBlock!='DEL') this.pseudoDatabase[this.mapHexToNum(this.getSelectedBlock)].Inventory--;
          this.getInv();
        }
      },
      //Get items matching search category and string.
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
      //Update appearance of category bar.
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
      //Get hex code of color categories
      getColor(cat) {
        if(cat===0) return "#FF9095";
        else if(cat===1) return "#A3FFC9";
        else if(cat===2) return "#7DAEFF"; 
        else return "#DDDDDD";
      },
      //Map category number to string
      mapCategory(cat) {
        if(cat===0) return "RED";
        else if(cat===1) return "GRN";
        else if(cat===2) return "BLU"; 
        else return "WHT";
      },
      //Map Decimal ID Number to Hex bas 32 string, for image mapping purposes.
      mapNumToHex(id) {
        if(id === 'DEL' || id===null) return id;
        let hexID = (Number(id)*4).toString(32);
        if(hexID.length===1) hexID = '0'+hexID;
        return hexID;
    },
    //Reverse the mapping of ID to base 32 string
    mapHexToNum(hex) {
        if(hex===null || hex==='DEL') return hex;
        return Math.floor(parseInt(hex,32)/4);
    },
    //Select a block to place when you click on it.
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
      //Get background color category of block for display purposes in inventory.
      getBg(id) {
        if(this.myBlock === this.mapNumToHex(id)) {
            return this.getColor(this.pseudoDatabase[Number(id)].Category);
        } else {
            return "white";
        }
      },
      //User has selected the delete a block option, update selected block accordingly.
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
      //Update inventory amount
      newInv(data) {
        this.pseudoDatabase[Number(data.Id)].Inventory = data.Inventory;
      },
      //Get inventory amount
      getInven(id) {
        try {
          return this.pseudoDatabase[Number(id)].Inventory;
        } catch(e) {
          return 'NA';
        }
      },
      //Get background of Dig Up Blocks icon
      delBg() {
        if(this.myBlock === 'DEL') {
            return "grey"; 
        } else {
            return "white";
        }
      },
      //API call to get inventory data.
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
            //console.log("INV");
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