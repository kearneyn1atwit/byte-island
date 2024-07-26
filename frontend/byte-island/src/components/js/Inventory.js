import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

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
        ...mapGetters(['getSelectedBlock','getPseudoDatabase']),
    },
    async mounted() {
        this.setSelectedBlock(null);
        await this.fillDatabase();
    },
    methods: {
        ...mapMutations(['setSelectedBlock']),
      async fillDatabase() {
        this.pseudoDatabase = this.getPseudoDatabase;
      },
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
      },
      getColor(rgb) {
        if(rgb/10000>=1) return "#FF9095";
        else if(rgb/100%100>=1) return "#A3FFC9";
        else if(rgb%100>=1) return "#7DAEFF"; 
        else return "#DDDDDD";
      },
      selectBlock(id) {
        let blockBtn = document.getElementById(id);
        if(this.myBlock === id) {
            blockBtn.style.backgroundColor="white";
            this.myBlock = null;
            this.setSelectedBlock(null);
        } else {
            blockBtn.style.backgroundColor=this.getColor(this.pseudoDatabase[Number(id)].RGB);
            this.myBlock = id;
            this.setSelectedBlock(id);
        }
      },
      currentBlock() {
        return this.myBlock;
      },
      getBg(id) {
        if(this.myBlock === id) {
            return this.getColor(this.pseudoDatabase[Number(id)].RGB);
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
      }
    },
    components: {

    },
  };