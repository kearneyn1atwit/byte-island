import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import Notifications from "./Notifications";
import Projects from "./Projects";
import Search from "./Search";
import Requests from "./Requests";
import Editor from "./Editor";
import Friends from './Friends';
import Posts from './Posts';
import Networks from "./Networks";
import Settings from "./Settings";
import Data from "../../data.json";

export default {
    data() {
      return {
        username: '',
        visitedUsername: '',
        pfp: '',
        rPoints: 0,
        gPoints: 0,
        bPoints: 0,
        island: null,
        friendRPoints: -1,
        friendGPoints: -1,
        friendBPoints: -1,
        friendIsland: null,
        friendIslandArr: null,
        requestCount: 0,
        notificationCount: 0,
        readCount: 0,
        drawer: false,
        loaded: false,
        islandDivLoaded: false,
        widget: "dashboard",
        showSignOut: false,
        showSuccessAlert: false,
        successAlertText: '',
        showErrorAlert: false,
        errorAlertText: '',
        showWarningAlert: false,
        warningAlertText: '',
        _isLoggedIn: false,
        token: null,
        mouseX: 0,
        mouseY: 0,
        myIndex: -1,
        indeces: [],
        isLeft: null,
        scale: 1.5,
        heightLimit: 4,
        //space doesn't update alongside scale, so if you increase scale up here, don't increase space, space is always calculated dynamically in the code.
        //space is intended to function like a constant.
        space: 32,
        sideLength: 8,
        xStart: 450,
        yStart: 340,
        spotDisplay: 0,
        islandData: null,
        showBackToIsland: false,
        rotateBit: 0,
        validIslandData: null,
        pseudoDatabase: null
      };
    },
    async created() {
      this.getUserDetails();
      // change to real authentication later
      if(!this._isLoggedIn) {
        this.$router.push('/');
      }
      else if(this.$route.params.id !== this.username) {
        this.$router.push('/not-found');
      }
    },
    computed: {
      ...mapGetters(['isLoggedIn','getUsername','getToken','getPoints','getDashboardCreateCount','getIslandData','getSelectedBlock','getPfp','getIsInInventory','getIslandStringData'])
    },
    async mounted() {
      await this.getNotifications();
      await this.getUserRequests();
      await this.getNetworkRequests();
      await this.fillDatabase();
      this.loaded = true;
      // only show welcome message when the user visited the dashboard after login
      if(!this.getDashboardCreateCount) {
        // this is VERY slow, look into later
        this.handleBadge();
      }
      this.visitDashboard();
      //make touchstart & touchend for mobile.
      document.addEventListener("mousemove",this.getMouseCoords);
      document.addEventListener("click",this.alterIsland);
      document.addEventListener("keydown", (e) => this.rotateBlock(e));
    },
    methods: {
        ...mapMutations(['setPoints','visitDashboard','resetDashboardVisit','resetStore','updateIsland','resetIsland','clearIsland','setSelectedBlock','setIsland']),
        async fillDatabase() {
          this.getBlockData();
        },
        //Determine if running on mobile platform.
        isMobile() {
          if(window.screen.width<=768) {
            return true
          } else {
            return false
          }
        },
        rotateBlock(event) {
          if(this.isInInventory() && (event.key === 'r' || event.key === 'R')) {
            this.rotateBit = (this.rotateBit+0.25)%1;
            if(document.getElementById('hoverBlock') && this.getSelectedBlock!='DEL') {
              let hovBlock = document.getElementById('hoverBlock');
              hovBlock.setAttribute('src','/'+this.mapNumToHex(this.mapHexToNum(this.getSelectedBlock)+this.rotateBit)+".png");
              //console.log(this.mapNumToHex(this.mapHexToNum(this.getSelectedBlock)+this.rotateBit));
            }
          }
        },
        //Used Claude AI to generate code to figure out if something is inside a parrallelogram, used to determine if mouse is within range to place a block.
        //Claude. (2023). Claude (Oct 8 version) [Chatbot].
        isPointInParallelogram(x1, y1, x2, y2, x3, y3, x4, y4, px, py) {
          function sign(pX, pY, x1, y1, x2, y2) {
              return (pX - x2) * (y1 - y2) - (x1 - x2) * (pY - y2);
          }
          let d1 = sign(px, py, x1, y1, x2, y2);
          let d2 = sign(px, py, x2, y2, x3, y3);
          let d3 = sign(px, py, x3, y3, x4, y4);
          let d4 = sign(px, py, x4, y4, x1, y1);
          let has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0) || (d4 < 0);
          let has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0) || (d4 > 0);
          return !(has_neg && has_pos);
        },
        //Determine isometric coordinate within plane to compute index in islandData array where placing a block at your cursor would overwrite.
        getAltCoords(x1,y1,x2,y2,pX,pY) {
          //Determine x distance and y distance of mouse pointer to a line, find the hypotenuse of the triangle made using those distances, divide hypotenuse by 2 to get isometric distance in pixels.
          const slope = (y1-y2)/(x1-x2);
          const altY = Math.abs(pY - (slope*(pX-x1)+y1));
          const altX = Math.abs(pX - (x1+((pY-y1)/slope)));
          //Use diagonal length and distance from supplied lines to determine how far along the diagonal plane the cursor is from the edge of the placing area.
          const space = this.space*this.scale;
          return Math.floor((Math.sqrt(altY**2+altX**2)/2)/(Math.sqrt(space**2 + (space/2)**2)));
        },
        //Determine is cursor is on left or right side of placeable tile
        leftOrRight(pX,onesPlace,eightsPlace) {
          const shift = eightsPlace-onesPlace;
          return pX < shift*48 + 482;
        },
        //Determine if user is in inventory widget.
        isInInventory() {
          return this.getSelectedBlock!=null;
        },
        //Determines if a cursor is at a placeable location
        canIPlaceHere(x,y) {
          if(this.$refs.editorRef && this.$refs.editorRef.editorView === 'inventory') {
            const scale = this.scale;
            const space = this.space*scale;
            const diagLength = Math.sqrt(space**2 + (space/2)**2);
            let baseCoords = [482,324,100,518,482,714,866,518]; //these are the coordinates forming the hitbox for layer 1 of the island at scale 1.5, space 32
            if(this.isMobile()) { 
             baseCoords = [198,352,4,444,198,540,390,444]; //mobile uses different scale & space so coords are different
            }
            const indeces = [];
            //loop determines all the isometric coordinates at your given mouse points location at which you could possible place a block.
            for(var plane=0;plane<(this.heightLimit+1);plane++) {
              const offset = plane*space; //48 for scale 1.5 and space 32.
              if(this.isPointInParallelogram(baseCoords[0],-baseCoords[1]+offset,baseCoords[2],-baseCoords[3]+offset,baseCoords[4],-baseCoords[5]+offset,baseCoords[6],-baseCoords[7]+offset,x,-y)) {
                const eightsPlace = this.getAltCoords(baseCoords[0],baseCoords[1]-offset,baseCoords[2],baseCoords[3]-offset,x,y);
                const onesPlace = this.getAltCoords(baseCoords[0],baseCoords[1]-offset,baseCoords[6],baseCoords[7]-offset,x,y);
                indeces.push((onesPlace+eightsPlace*8)+plane*64);
              }
            }
            //Return all places on the island you could possibly place a block given cursor location
            const eightsPlace = this.getAltCoords(baseCoords[0],baseCoords[1],baseCoords[2],baseCoords[3],x,y);
            const onesPlace = this.getAltCoords(baseCoords[0],baseCoords[1],baseCoords[6],baseCoords[7],x,y);
            return [indeces,this.leftOrRight(x,onesPlace,eightsPlace)];
          } else {
            return [[],null];
          }
        },
        getMouseCoords(event) {
          this.mouseX = event.pageX;
          this.mouseY = event.pageY;
          this.updateWithMouse(this.mouseX,this.mouseY);
        },
        //Every time the mouse moves, check to see if you must update the block placer indicator
        updateWithMouse(pageX,pageY) {
          this.mouseX = pageX;
          this.mouseY = pageY;
          const results = this.canIPlaceHere(this.mouseX,this.mouseY);
          if(document.getElementById('hoverBlock')){
            document.getElementById('hoverBlock').remove();
          }
          this.indeces = results[0];
          this.isLeft = results[1];
          const myIslandData = this.islandData;

          const scale = this.scale;
          const space = this.space * scale;
          const sideLength = this.sideLength;
          const squareSize = sideLength**2;
          const xStart = this.xStart;
          const yStart = this.yStart;

          //Go through all possible coordinates your mouse cursor could be placing at, and determine the first one it can actually place at.
          for(var x=this.indeces.length-1;x>=0;x--) {
            const spot = this.indeces[x];
            //To place (or delete) a block, you must be hovering over another block, and there must be nothing above you. You must also have a block selected.
            if(this.mapHexToNum(myIslandData[spot])!=0 && this.mapHexToNum(myIslandData[spot+squareSize])===0 && /*(this.mapHexToNum(myIslandData[spot+squareSize+sideLength+1])===0 || spot%sideLength===sideLength-1) &&*/ this.getSelectedBlock) {

              const canDelete = (this.getSelectedBlock==='DEL' && this.mapHexToNum(myIslandData[spot])!=1);
              const canPlace = (this.getSelectedBlock!='DEL' && spot<squareSize * this.heightLimit && this.pseudoDatabase[this.mapHexToNum(this.getSelectedBlock)].Inventory>0);
              
              if(!(canDelete || canPlace)) break;
              
              let thisBlock = document.createElement('img');
              let style = thisBlock.style;
              style.position = 'absolute';
              const control = spot%(squareSize);

              //Only difference between placing and deleting is that the place outline block is placed 1 layer higher than the delete block
              let offset;
              if(canDelete) {
                offset = -1*space*(Math.floor(spot/(squareSize)))+(Math.floor(spot/(squareSize)))+1;
                thisBlock.setAttribute('src','/blockdelete.png');
                style.zIndex = spot*2;
              } else {
                offset = -1*space*(Math.floor(spot/(squareSize))+1)+(Math.floor(spot/(squareSize)))+1;
                thisBlock.setAttribute('src','/'+this.mapNumToHex(this.mapHexToNum(this.getSelectedBlock)+this.rotateBit)+".png");
                style.opacity = 0.66;
                style.zIndex = (spot+this.sideLength**2)*2;
              }
              //Create place/delete indicator
              this.spotDisplay=spot;
              const left = xStart + (space*((control%sideLength*-1)+Math.floor(control/sideLength)));
              const top = yStart + offset + ((space/2)*((control%sideLength)+Math.floor(control/sideLength)));
              style.left = left.toString()+"px";
              style.top = top.toString()+"px";
              style.transform = `scale(${scale})`;
              thisBlock.setAttribute('spot',spot.toString());
              thisBlock.setAttribute('alt','hover-'+spot.toString());
              thisBlock.setAttribute('class','hoverBlock');
              thisBlock.setAttribute('id','hoverBlock');
              document.getElementById("islandHolder").appendChild(thisBlock);
              break;

            }
          }
        },
        //When you click down with your mouse, check to see if a place/delete indicator is anywhere on the screen, and replace it with
        //the relevant block, or lack of a block in case of delete.
        alterIsland(event) {
          if(document.getElementById('hoverBlock')) {
            let thisBlock = document.createElement('img');
            let hovBlock = document.getElementById('hoverBlock');
            let thisStyle = thisBlock.style;
            let hovStyle = hovBlock.style;
            thisStyle.position = hovStyle.position;
            thisStyle.left = hovStyle.left;
            thisStyle.top = hovStyle.top;
            thisStyle.transform = hovStyle.transform;
            thisStyle.zIndex = hovStyle.zIndex;
            const spot = Number(hovBlock.getAttribute('spot'));
            if(this.getSelectedBlock==='DEL') {
              thisBlock.setAttribute('src','/00.png');
              thisBlock.setAttribute('alt','block-'+(spot).toString());
              thisBlock.setAttribute('class','placeableBlock');
              thisBlock.setAttribute('id','block-'+(spot).toString());
              const blockWeDel = this.islandData[spot];
              this.islandData[spot] = '00';
              this.validIslandData = this.validIslandData.substring(0,spot*2)+'00'+this.validIslandData.substring((spot+1)*2);
              this.updateIsland({index: spot, newData:'00'});
              document.getElementById('block-'+(spot)).remove();
              document.getElementById("islandHolder").appendChild(thisBlock);
              document.getElementById('hoverBlock').remove();
              //Update inventory on backend every time you place a block!
              this.pseudoDatabase[this.mapHexToNum(blockWeDel)].Inventory++;
              this.updateBackWithBlock(this.validIslandData,this.mapHexToNum(blockWeDel),true);
            } else {
              const hex2Num = this.mapHexToNum(this.getSelectedBlock);
              thisBlock.setAttribute('src','/'+this.mapNumToHex(hex2Num+this.rotateBit)+".png");
              thisBlock.setAttribute('alt','block-'+(spot+64).toString());
              thisBlock.setAttribute('class','placeableBlock');
              thisBlock.setAttribute('id','block-'+(spot+64).toString());
              const exactBlock = this.mapNumToHex(hex2Num+this.rotateBit);
              const squareSize = this.sideLength**2;
              this.islandData[spot+squareSize] = exactBlock;
              this.validIslandData = this.validIslandData.substring(0,(spot+squareSize)*2)+exactBlock+this.validIslandData.substring((spot+squareSize+1)*2);
              this.updateIsland({index: spot+squareSize, newData: exactBlock});
              document.getElementById('block-'+(spot+squareSize)).remove();
              document.getElementById("islandHolder").appendChild(thisBlock);
              try {
                this.pseudoDatabase[hex2Num].Inventory--;
              } catch(e) {
                console.log("ERROR!");
              }
              this.updateBackWithBlock(this.validIslandData,hex2Num,false);
            }
          }
        },
        async updateBackWithBlock(islandData,blockId,add) {
          fetch("http://"+Data.host+":5000/island", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json', 
                'Authorization': this.getToken
            },
            body: JSON.stringify({
                username: this.getUsername,
                islanddata: islandData,
                blockid: blockId,
                add: add
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
                    return;
                  }
            }
            return response.json(); 
        })
        .then(data => {

        })
        .catch(error => {
            console.error('Error with Block Place API:', error);
        });
        },
        parseFIsland(fIsland) {
          this.friendIslandArr = [];
          let tempFIsland = this.friendIsland;
            for(let i=0;i<384;i++) {
                this.friendIslandArr.push(tempFIsland.slice(0,2));
                tempFIsland=tempFIsland.substring(2);
            }
          this.genIsland();
        },
        //Attempt to gen island when page first loads.
        attemptGenIsland() {

          if(document.getElementById("islandHolder")) {
            this.genIsland();
            this.islandDivLoaded=true;
          }
          this.validIslandData="";
          const ourIslandData = this.getIslandData;
          for(var i=0;i<ourIslandData.length;i++) {
            this.validIslandData+=ourIslandData[i];
          }
        },
        genIsland() {

          //Deletes every block in the island.
          let islandDiv = document.getElementById("islandHolder");
          for(var x=0;x<(this.sideLength**2 * (this.heightLimit+1));x++) {
            let delBlock = document.getElementById('block-'+x.toString());
            if(delBlock) delBlock.remove();
          }

          if(this.isMobile()) {
            this.xStart = 165;
            this.scale = 0.75;
          } else {
            this.xStart = 450;
            this.scale = 1.5;
          }

          //Setup constants, used to place each block.
          let counter = 0; //Index of block being placed
          const scale = this.scale; //Scale of blocks; 1.5 is default for desktop to make images bigger
          const space = this.space * scale; //this.space is a constant, representing the image length of 1 block in pixels. (The pngs are 32 pixels long & wide)
          const sideLength = this.sideLength; //The island is sidelength x sidelength tiles big (8 by default)
          const xStart = this.xStart; //Starting X offset for 1st block. Different for different platforms.
          const yStart = this.yStart; //Starting Y offset for 1st block. Different for different platforms.
          //let myIslandData = this.getIslandData; //get current island data to render. Always empty, as it is now.
          let myIslandData;
          if(this.friendRPoints<0) {
            myIslandData = this.getIslandData; //get current island data to render. Always empty, as it is now.
            this.islandData = myIslandData; //Set island data to be empty. We're genning it again, after all!
          } else {
            myIslandData = this.friendIslandArr;
            this.islandData = myIslandData;
          }
          //Loop through every block stored in island data array, and create and style an image in accordance with data.
          for(var index in myIslandData) {
              index = Number(index);
              let block = myIslandData[index];
              let id = this.mapHexToNum(block);
              let thisRotation = this.getRotation(block);
              let thisBlock = document.createElement('img');
              let style = thisBlock.style;
              style.position = 'absolute';
              const control = counter%(sideLength**2); //"Control" is counter, but treats every layer as layer 1, for determining x/y placement.
              const offset = -1*(space)*Math.floor(counter/(sideLength**2))+(Math.floor(counter/(sideLength**2)))+1;
              const left = xStart + ((space)*((control%sideLength*-1)+Math.floor(control/sideLength)));
              const top = yStart + offset + ((space/2)*((control%sideLength)+Math.floor(control/sideLength)));
              style.left = left.toString()+"px";
              style.top = top.toString()+"px";
              style.transform = `scale(${scale})`;
              style.zIndex = counter*2;
              thisBlock.setAttribute('src','/'+this.mapNumToHex(id+thisRotation)+'.png');
              thisBlock.setAttribute('alt',block+'-'+counter.toString());
              thisBlock.setAttribute('class','placeableBlock');
              thisBlock.setAttribute('id','block-'+counter.toString());
              islandDiv.appendChild(thisBlock);
              counter++;
          }

          this.islandDivLoaded=true;

        },
        /*
          Title: Rotating a 2d Array
          Author: Nitin Jadhav
          Date: 6 Dec 2022
          Source: https://stackoverflow.com/questions/15170942/how-to-rotate-a-matrix-in-an-array-in-javascript
        */
        //
        // rotateIsland() {
        //   let newIslandData = this.getIslandData;
        //   let finIsl = [];
        //   for(let x=0;x<this.heightLimit+1;x++) {
        //     let islandSlice = newIslandData.slice(x*this.sideLength**2,(x+1)*this.sideLength**2);
        //     let islandSlice2D = [];
        //     while(islandSlice.length) islandSlice2D.push(islandSlice.splice(0,this.sideLength));
        //     islandSlice2D[0].map((val, index) => islandSlice2D.map(row => row[index]).reverse());
        //     finIsl.push(islandSlice2D);
        //   }
        //   let rotIsl = "";
        //   for(let x=0;x<finIsl.length;x++) {
        //     for(let y=0;y<finIsl[x].length;y++) {
        //       for(let z=0;z<finIsl[x][y].length;z++) {
        //         rotIsl+=finIsl[x][y][z];
        //       }
        //     }
        //   }
        //   rotIsl+=("00".repeat(64))
        //   this.setIsland(rotIsl);
        //   this.genIsland();
        // },
        //Convert decimal ID number of block into a base32 string, for purposes of mapping it to an image name.
        mapNumToHex(id) {
          if(id === 'DEL' || id===null) return id;
          let hexID = (Number(id)*4).toString(32);
          if(hexID.length===1) hexID = '0'+hexID;
          return hexID;
        },
        //Map base32 string to decimal id, for purposes of fetching block info from Shop data DB.
        mapHexToNum(hex) {
            if(hex===null || hex==='DEL') return hex;
            return Math.floor(parseInt(hex,32)/4);
        },
        //Get what direction a block is rotated in
        getRotation(hex) {
          if(hex===null || hex==='DEL') return hex;
          return (parseInt(hex,32)%4)*0.25;
        },
        //api call to get user data upon login
        getUserDetails() {
          this._isLoggedIn = this.isLoggedIn;
          this.token = this.getToken;
          this.username = this.getUsername;
          this.visitedUsername = this.username;
          this.pfp = this.getPfp;
          this.rPoints = this.getPoints[0];
          this.gPoints = this.getPoints[1];
          this.bPoints = this.getPoints[2];
          // get island data
          this.island = null;
        },
        async getNotifications() {
          return fetch("http://"+Data.host+":5000/notifications/"+this.username, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json', 
                  'Authorization': this.token
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
                  this.showErrorAlertFunc(response.statusText);
                  return;
                }
              }
              //console.log("Response was okay!");
              return response.json(); 
          })
          .then(data => {
            if(data.message) {
              this.notificationCount = 0;
            }
            else {
              this.notificationCount = data.length;
            }
            this.readCount = 0;
            for(let i=0;i<data.length;i++) {
              if(data[i].Read) {
                this.readCount++;
              }
            }
          })
          .catch(error => {
            this.notificationCount = 0;
            this.readCount = 0;
            console.error('Error with Notifications API:', error);
            this.showErrorAlertFunc(error);
          });
        },
        async getUserRequests() {
          this.requestCount = 0;
          // api call to get requests (get just list length)
          return fetch("http://"+Data.host+":5000/requests/"+this.username+"/user/open", {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json', 
                  'Authorization': this.token
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
                  this.showErrorAlertFunc(response.statusText);
                  return;
                }
              }
              //console.log("Response was okay!");
              return response.json(); 
          })
          .then(data => {
            if(data!==undefined && !data.message) {
              this.requestCount = data.length;
            }
          })
          .catch(error => {
            console.error('Error with Requests API:', error);
          });
        },
        async getNetworkRequests() {
          return fetch("http://"+Data.host+":5000/requests/"+this.username+"/network/open", {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json', 
                  'Authorization': this.token
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
                  this.showErrorAlertFunc(response.statusText);
                  return;
                }
              }
              //console.log("Response was okay!");
              return response.json(); 
          })
          .then(data => {
            if(data!==undefined && !data.message) {
              this.requestCount += data.length;
            }
          })
          .catch(error => {
            console.error('Error with Requests API:', error);
            this.showErrorAlertFunc(error);
          });
        },
        getAllRequests() {
          this.getUserRequests();
          this.getNetworkRequests();
        },
        handleBadge() {
          // wait half a second so transition is smoother
          let wait = 500;
          let self = this;
          setTimeout(function() {
            if(self.notificationCount > 0 && self.requestCount > 0) {
              self.showSuccessAlertFunc('Welcome, '+self.username+'! You have '+self.notificationCount+' notification(s) and '+self.requestCount+' request(s).');
            }
            else if(self.notificationCount > 0 && self.requestCount === 0) {
              self.showSuccessAlertFunc('Welcome, '+self.username+'! You have '+self.notificationCount+' notifcation(s).');
            }
            else if(self.notificationCount === 0 && self.requestCount > 0) {
              self.showSuccessAlertFunc('Welcome, '+self.username+'! You have '+self.requestCount+' request(s).');
            }
            else {
              self.showSuccessAlertFunc('Welcome, '+self.username+'!');
            }
          }, wait);
        },
        signOut() {
          // expire token
          this.$router.push('/');
          this.resetStore();
        },
        // could get complicated with nested menus, be sure to have a reference to each widget
        toWidget(widget) {
          // if reference to projects exists (user is in projects view)
          if(this.$refs.projectsRef) {
            // if user is in "new project" view
            if(this.$refs.projectsRef.projectView === 'new' || this.$refs.projectsRef.projectView === 'edit') {
              // when they click back, just go back to "all projects" view and reset new project data
              this.$refs.projectsRef.resetData();
            }
            // if user is in "all projects" view
            else {
              this.widget = widget;
            }
            //if in Island Editor, go back to editor page when clicking arrow.
          } else if(this.$refs.editorRef) {
              if(this.$refs.editorRef.editorView === 'shop' || this.$refs.editorRef.editorView === 'inventory') {
                this.$refs.editorRef.editorView = "editor";
              } else {
                this.widget = widget;
              }
              //if in Friend view, go back to all friends and load users island data
          } else if(this.$refs.friendsRef) {
            if(this.$refs.friendsRef.friendVisited) {
              this.$refs.friendsRef.friendVisited = false;
              this.$refs.friendsRef.friendsData = 0;
              // this.returnIsland();
            } else {
              this.widget = widget;
            }
            //if in Network view, go back to all networks
          } else if(this.$refs.networksRef) {
            if(this.$refs.networksRef.userVisited) {
              this.$refs.networksRef.userSearch = '';
              this.$refs.networksRef.userVisited = false;
              this.$refs.networksRef.usersData = 0;
              this.$refs.networksRef.view(this.$refs.networksRef.viewedNetwork);
              // this.returnIsland();
            }
            else if(this.$refs.networksRef.networkVisited) {
              this.$refs.networksRef.networkVisited = false;
              this.$refs.networksRef.showDesc = false;
              this.$refs.networksRef.userSearch = '';
              this.$refs.networksRef.getNetworks();
            } else {
              this.widget = widget;
            }
          }
          // user has not opened projects view
          else {
            this.widget = widget;
          }
        },
        showSuccessAlertFunc(text) {
          this.successAlertText = text;
          this.showSuccessAlert = true;
          setTimeout(() => this.hideAlerts(),4000);
        },
        showErrorAlertFunc(text) {
          this.errorAlertText = text;
          this.showErrorAlert = true;
          setTimeout(() => this.hideAlerts(),4000);
        },
        showWarningAlertFunc(text) {
          this.warningAlertText = text;
          this.showWarningAlert = true;
          setTimeout(() => this.hideAlerts(),4000);
        },
        hideAlerts() {
          this.showSuccessAlert = false;
          this.successAlertText = '';
          this.showErrorAlert = false;
          this.errorAlertText = '';
          this.showWarningAlert = false;
          this.warningAlertText = '';
        },
        projectCompleted(text) {
          this.showSuccessAlertFunc(text);
          this.rPoints = this.getPoints[0];
          this.gPoints = this.getPoints[1];
          this.bPoints = this.getPoints[2];
        },
        visitFriend(friend) {
          this.showBackToIsland = true;
          this.friendRPoints = friend.points[0];
          this.friendGPoints = friend.points[1];
          this.friendBPoints = friend.points[2];
          this.visitedUsername = friend.username;
          this.friendIsland = friend.island;
          this.parseFIsland(this.friendIsland);
        },
        checkIfShouldReturn() {
          if(this.friendRPoints>=0) {
            this.returnIsland();
          }
        },
        // return to users island
        returnIsland() {
          if(this.$refs.friendsRef) {
            this.$refs.friendsRef.friendVisited = false;
            this.$refs.friendsRef.friendsData = 0;
          }  
          if(this.$refs.networksRef) {
            this.$refs.networksRef.userSearch = '';
            this.$refs.networksRef.userVisited = false;
            this.$refs.networksRef.usersData = 0;
            this.$refs.networksRef.view(this.$refs.networksRef.viewedNetwork);
          }
          this.friendRPoints = -1;
          this.getUserDetails();
          this.genIsland();
        },
        //get individual points from each category
        getRPoints() { return this.getPoints[0] },
        getGPoints() { return this.getPoints[1] },
        getBPoints() { return this.getPoints[2] },
        //Get data on all different blocks
        getBlockData() {
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
              //console.log(this.pseudoDatabase);
          })
          .catch(error => {
              console.error('Error with Shop API:', error);
              this.$emit('shop-fetch-error',error);
          });
      }
    },
    components: {
      Notifications,
      Projects,
      Search,
      Requests,
      Editor,
      Friends,
      Posts,
      Networks,
      Settings
    },
  };