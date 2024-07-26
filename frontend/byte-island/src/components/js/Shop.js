import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import Data from "../../data.json";

export default {
    data() {
      return {
            searchCategory: 'ALL',
            searchTab: 0,
            searchString: "",
            itemList: [],
            buyNew: false,
            purchaseAmnt: 0,
            purchaseType: "RED",
            purchaseColor: "#FF9095",
            baseCost: 0,
            pseudoDatabase: null
        };
    },
    created() {
        
    },
    computed: {
        ...mapGetters(['getPseudoDatabase','getPoints'])
    },
    async mounted() {
        await this.fillDatabase();
    },
    methods: {
        ...mapMutations(['setPoints']),
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
        getCost(rgb,color) {
            if(color==='RED') return rgb/10000;
            else if(color==='GRN') return rgb/100%100;
            else if(color==='BLU') return rgb%100>=1; 
            else return 0;
        },
        purchaseItem(id) {
            this.purchaseAmnt=0;
            let rgb = this.pseudoDatabase[Number(id)];
            this.purchaseColor = this.getColor(rgb);
            if(this.purchaseColor==="#FF9095") this.purchaseType='RED';
            else if(this.purchaseColor==="#A3FFC9") this.purchaseType='GRN';
            else if(this.purchaseColor==="#7DAEFF") this.purchaseType='BLU';
            else this.purchaseType='WHT'
            this.baseCost = this.getCost(rgb,this.purchaseType);
            this.buyNew=true;
        },
        finishPurchaseItem() {
            let points = this.getPoints;
            if(this.purchaseType==='RED') points[0]-=this.purchaseAmnt*baseCost;
            else if(this.purchaseType==='GRN') points[1]-=this.purchaseAmnt*baseCost;
            else if(this.purchaseType==='BLU') points[2]-=this.purchaseAmnt*baseCost;
            this.setPoints(points);
            this.purchaseAmnt=0;
            this.buyNew=false;
        },
        canPurchase() {
            let points = this.getPoints;
            if(this.purchaseType==='RED') return points[0]>=this.purchaseAmnt*baseCost;
            else if(this.purchaseType==='GRN') return points[1]>=this.purchaseAmnt*baseCost;
            else if(this.purchaseType==='BLU') return points[2]>=this.purchaseAmnt*baseCost;
            else return false;
        }
    },
    components: {

    },
  };