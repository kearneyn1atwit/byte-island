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
            purchaseCat: 0,
            baseCost: 0,
            purchaseId: null,
            pseudoDatabase: null
        };
    },
    created() {
        
    },
    computed: {
        ...mapGetters(['getPoints','getUsername','getToken'])
    },
    async mounted() {
        await this.fillDatabase();
    },
    methods: {
        ...mapMutations(['setPoints','resetStore']),
        async fillDatabase() {
            this.getShop();
        },
        fetchDBItems() {
            return this.pseudoDatabase.slice(2,4);
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
        purchaseItem(id) {
            this.purchaseAmnt=0;
            const myId = Number(id);
            const cost = this.pseudoDatabase[myId].Points;
            const cat = this.pseudoDatabase[myId].Category;
            this.purchaseId = myId;
            this.purchaseCat = cat;
            this.purchaseColor = this.getColor(cat);
            this.purchaseType = this.mapCategory(cat);
            this.baseCost = cost;
            this.buyNew=true;
        },
        finishPurchaseItem() {
            fetch("http://"+Data.host+":5000/shop", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.getToken
                },
                body: JSON.stringify({
                    username: this.getUsername,
                    id: Number(this.purchaseId),
                    buy: true,
                    quantity: Number(this.purchaseAmnt)
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
                        this.$emit('shop-purchase-error',response.statusText);
                        return;
                      }
                }
                return response.json(); 
            })
            .then(data => {
                let points = this.getPoints;
                points[this.purchaseCat]-=this.purchaseAmnt*this.baseCost;
                this.pseudoDatabase[this.purchaseId].Inventory=Number(this.pseudoDatabase[this.purchaseId].Inventory) + Number(this.purchaseAmnt);
                this.setPoints(points);
                this.purchaseAmnt=0;
                this.buyNew=false;
            })
            .catch(error => {
                console.error('Error with Shop API:', error);
                this.$emit('shop-purchase-error',error);
            });
        },
        canPurchase() {
            return this.getPoints[this.purchaseCat]>=this.purchaseAmnt*this.baseCost;
        },
        numericOnly(input) {
           return /^\d+$/.test(input);
        },
        displayCost() {
            if(this.purchaseAmnt*this.baseCost>9999) return "9999+";
            else return this.purchaseAmnt*this.baseCost;
        },
        getShop() {
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
                        this.$emit('shop-fetch-error',response.statusText);
                        return;
                      }
                }
                return response.json(); 
            })
            .then(data => {
                this.pseudoDatabase = data;
            })
            .catch(error => {
                console.error('Error with Shop API:', error);
                this.$emit('shop-fetch-error',error);
            });
        }
    },
    components: {

    },
  };