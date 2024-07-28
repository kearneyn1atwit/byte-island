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
        requestCount: 0,
        notificationCount: 0,
        readCount: 0,
        drawer: false,
        loaded: false,
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
        //delHereDisplay: 0,
        //spotDisplay: 0,
        islandData: null,
        showBackToIsland: false,
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
      ...mapGetters(['isLoggedIn','getUsername','getToken','getPoints','getDashboardCreateCount','getIslandData','getSelectedBlock','getPfp'])
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
      document.addEventListener("mousemove",this.getMouseCoords);
      document.addEventListener("click",this.alterIsland);
    },
    methods: {
        ...mapMutations(['setPoints','visitDashboard','resetDashboardVisit','resetStore','updateIsland','resetIsland','clearIsland']),
        async fillDatabase() {
          this.getBlockData();
        },
        //Determine if running on mobile platform.
        isMobile() {
          if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true
          } else {
            return false
          }
        },
        //Used Claude AI to generate code to figure out if something is inside a parrallelogram, used to determine if mouse is within range to place a block.
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
          //53.778 is the diagonal distance in pixels across a block, at scale 1.5 which is what the program will be using for the demo, because I'm strapped for time.
          //35.852 at scale 1.
          //Actually 53.665631 & 35.77709?? Yeah, looks like it. sqrt(32^2 + 16^2) = 35.777...
          const space = this.space*this.scale;
          return Math.floor((Math.sqrt(altY**2+altX**2)/2)/(Math.sqrt(space**2 + (space/2)**2)));
        },
        leftOrRight(pX,onesPlace,eightsPlace) {
          const shift = eightsPlace-onesPlace;
          //return pX < shift*48.5 + 482;
          return pX < shift*48 + 482;
        },
        canIPlaceHere(x,y) {
          if(this.$refs.editorRef && this.$refs.editorRef.editorView === 'inventory') {
            const scale = this.scale;
            const space = this.space*scale;
            const diagLength = Math.sqrt(space**2 + (space/2)**2);
            const baseCoords = [482,324,100,518,482,714,866,518]; //these are the coordinates forming the hitbox for layer 1 of the island at scale 1.5, space 32
            //const baseCoords = [xStart+space,yStart-(space/2),xStart,xStart-(space*(this.sideLength-1))];
            const indeces = [];
            for(var plane=0;plane<5;plane++) {
              const offset = plane*48; //48 for scale 1.5 and space 32.
              if(this.isPointInParallelogram(baseCoords[0],-baseCoords[1]+offset,baseCoords[2],-baseCoords[3]+offset,baseCoords[4],-baseCoords[5]+offset,baseCoords[6],-baseCoords[7]+offset,x,-y)) {
                const eightsPlace = this.getAltCoords(baseCoords[0],baseCoords[1]-offset,baseCoords[2],baseCoords[3]-offset,x,y);
                const onesPlace = this.getAltCoords(baseCoords[0],baseCoords[1]-offset,baseCoords[6],baseCoords[7]-offset,x,y);
                indeces.push((onesPlace+eightsPlace*8)+plane*64);
              }
            }
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

          for(var x=this.indeces.length-1;x>=0;x--) {
            const spot = this.indeces[x];
            if(myIslandData[spot]!='00' && myIslandData[spot+squareSize]==='00' && this.getSelectedBlock) {

              const canDelete = (this.getSelectedBlock==='DEL' && myIslandData[spot]!='01');
              const canPlace = (this.getSelectedBlock!='DEL' && spot<squareSize * this.heightLimit);

              if(!(canDelete || canPlace)) break;
              
              let thisBlock = document.createElement('img');
              let style = thisBlock.style;
              style.position = 'absolute';
              const control = spot%(squareSize);

              //Only difference between placing and deleting is that the place outline block is placed 1 layer higher than the delete
              //outline block, and the image is blue for placing but red for deleting.
              let offset;
              if(canDelete) {
                offset = -1*space*(Math.floor(spot/(squareSize)))+(Math.floor(spot/(squareSize)))+1;
                thisBlock.setAttribute('src','/blockdelete.png');
              } else {
                offset = -1*space*(Math.floor(spot/(squareSize))+1)+(Math.floor(spot/(squareSize)))+1;
                thisBlock.setAttribute('src','/blockplace.png');
              }
              const left = xStart + (space*((control%sideLength*-1)+Math.floor(control/sideLength)));
              const top = yStart + offset + ((space/2)*((control%sideLength)+Math.floor(control/sideLength)));
              style.left = left.toString()+"px";
              style.top = top.toString()+"px";
              style.transform = `scale(${scale})`;
              style.zIndex = spot*2;
              thisBlock.setAttribute('spot',spot.toString());
              thisBlock.setAttribute('alt','hover-'+spot.toString());
              thisBlock.setAttribute('class','hoverBlock');
              thisBlock.setAttribute('id','hoverBlock');
              document.getElementById("islandHolder").appendChild(thisBlock);
              break;

            }
          }
        },
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
              this.islandData[spot] = '00';
              this.updateIsland({index: spot, newData:'00'});
              document.getElementById('block-'+(spot)).remove();
              document.getElementById("islandHolder").appendChild(thisBlock);
              document.getElementById('hoverBlock').remove();
            } else {
              thisBlock.setAttribute('src','/'+this.getSelectedBlock+".png");
              thisBlock.setAttribute('alt','block-'+(spot+64).toString());
              thisBlock.setAttribute('class','placeableBlock');
              thisBlock.setAttribute('id','block-'+(spot+64).toString());
              this.islandData[spot+64] = this.getSelectedBlock;
              this.updateIsland({index: spot+64, newData: this.getSelectedBlock});
              document.getElementById('block-'+(spot+64)).remove();
              document.getElementById("islandHolder").appendChild(thisBlock);
            }
          }
        },
        genIsland() {
          //let blockArray = document.getElementsByClassName("placeableBlock");

          //Deletes every block in the island.
          let islandDiv = document.getElementById("islandHolder");
          for(var x=0;x<(this.sideLength**2 * (this.heightLimit+1));x++) {
            let delBlock = document.getElementById('block-'+x.toString());
            if(delBlock) delBlock.remove();
          }
          //Updates state to also clear the island, not just locally.
          this.clearIsland();

          //Setup constants, used to place each block.
          let counter = 0; //Index of block being placed
          const scale = this.scale; //Scale of blocks; 1.5 is default for desktop to make images bigger
          const space = this.space * scale; //this.space is a constant, representing the image length of 1 block in pixels. (The pngs are 32 pixels long & wide)
          const sideLength = this.sideLength; //The island is sidelength x sidelength tiles big (8 by default)
          const xStart = this.xStart; //Starting X offset for 1st block. Different for different platforms.
          const yStart = this.yStart; //Starting Y offset for 1st block. Different for different platforms.
          const myIslandData = this.getIslandData; //get current island data to render. Always empty, as it is now.
          this.islandData = myIslandData; //Set island data to be empty. We're genning it again, after all!

          for(var index in myIslandData) {
              index = Number(index);
              let block = myIslandData[index];
              let id = Number(block);
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
              thisBlock.setAttribute('src','/'+this.mapNumToHex(id)+'.png');
              thisBlock.setAttribute('alt',block+'-'+counter.toString());
              thisBlock.setAttribute('class','placeableBlock');
              thisBlock.setAttribute('id','block-'+counter.toString());
              islandDiv.appendChild(thisBlock);
              counter++;
          }

        },
        //https://stackoverflow.com/questions/15170942/how-to-rotate-a-matrix-in-an-array-in-javascript
        rotateIslandClockwise() {
          let newIslandData = this.myIslandData;
          for(let x=0;x<this.heightLimit+1;x++) {
            let islandSlice = newIslandData.slice(x*this.sideLength**2,(x+1)*this.sideLength**2);
            //https://stackoverflow.com/questions/22464605/convert-a-1d-array-to-2d-array
            let islandSlice2D = [];
            while(islandSlice.length) islandSlice2D.push(island.splice(0,sideLength));
            islandSlice2D[0].map((val, index) => islandSlice2D.map(row => row[index]).reverse());
          }

        },
        //https://stackoverflow.com/questions/15170942/how-to-rotate-a-matrix-in-an-array-in-javascript
        rotateIslandCounterClockwise() {

        },
        mapNumToHex(id) {
          if(id === 'DEL' || id===null) return id;
          let hexID = Number(id).toString(16);
          if(hexID.length===1) hexID = '0'+hexID;
          return hexID;
        },
        mapHexToNum(hex) {
          if(hex===null || hex==='DEL') return hex;
          return parseInt(hex,16);
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
            if(!data.message) {
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
            if(!data.message) {
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
        },
        getRPoints() { return this.getPoints[0] },
        getGPoints() { return this.getPoints[1] },
        getBPoints() { return this.getPoints[2] },
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

//Below is the Shadow Realm, land of dead code.

  //Was in genIslands()
  /*
  if(id!=1 && index+64<320 && myIslandData[index+64]==="00000001") {
    let hoverBlock = document.createElement('img');
    let hoverStyle = hoverBlock.style;
    hoverStyle.position = 'absolute';
    hoverStyle.left = left.toString()+"px";
    hoverStyle.top = (top-(scale*space)).toString()+"px";
    //hoverStyle.top = top.toString()+"px";
    hoverStyle.transform = `scale(${scale})`;
    hoverStyle.opacity = 0;
    hoverStyle.transition = 'opacity 0.1s ease';
    hoverBlock.setAttribute('src',"/blockplace.png");
    hoverBlock.setAttribute('alt','hover-'+counter.toString()); 
    hoverBlock.setAttribute('id','hover-'+counter.toString()); 
    hoverBlock.addEventListener("clear", (event) => {
      hoverStyle.opacity = 0;
    });
    elementArray[counter+64]=hoverBlock;
  }
  */

  //Was for placing blocks on the side of blocks. Buggy mess.
  /*
            if(this.getSelectedBlock && (
              (this.isLeft && myIslandData[spot+ squareSize + 1]!='00000001') || (!this.isLeft && myIslandData[spot+ squareSize + sideLength]!='00000001')//&& Math.floor(spot%64/sideLength)!=sideLength-1) //&& spot%sideLength!=sideLength-1) 
              || (this.isLeft && myIslandData[spot+ squareSize]!='00000001') || (!this.isLeft && myIslandData[spot+ squareSize]!='00000001')
              )) {
                this.spotDisplay = spot;
                /*
                let whichSide;
                if(((this.isLeft && myIslandData[spot+squareSize + 1]!='00000001') || (!this.isLeft && myIslandData[spot+squareSize]!='00000001'))) whichSide = true; //right
                else whichSide = false; //left

                let upDown;
                if((whichSide===sideLength && this.isLeft) || (whichSide===1 && !this.isLeft)) upDown = true; //up
                else upDown = false; //down
                */

                //const canDelete = this.getSelectedBlock==='DEL';
                //const canPlace = (!canDelete && (whichSide && upDown && myIslandData[]))

                // && myIslandData[spot+ squareSize + sideLength + 1]==='00000001'
                // && myIslandData[spot+ squareSize + sideLength]==='00000001'
                // && myIslandData[spot+ squareSize + 1]==='00000001'
                // && myIslandData[spot+ squareSize + sideLength + 1]==='00000001'
            /*
                if(this.getSelectedBlock==='DEL') {
                  let delHere;
                  if(this.isLeft && myIslandData[spot+squareSize+1]!='00000001') delHere = spot+squareSize+1;
                  else if(!this.isLeft && myIslandData[spot+squareSize+sideLength]!='00000001') delHere = spot+squareSize+sideLength;
                  else delHere = spot+squareSize;

                  this.delHereDisplay = delHere;
                  
                  if(myIslandData[delHere+squareSize]!='00000001' || myIslandData[delHere]-squareSize==='00000001') break;

                  let thisBlock = document.createElement('img');
                  let style = thisBlock.style;
                  style.position = 'absolute';
                  const control = delHere%(squareSize);

                  const offset = -1*space*(Math.floor(delHere/(squareSize)))+(Math.floor(delHere/(squareSize)))+1;
                  const left = xStart + (space*((control%sideLength*-1)+Math.floor(control/sideLength)));
                  const top = yStart + offset + ((space/2)*((control%sideLength)+Math.floor(control/sideLength)));
                  style.left = left.toString()+"px";
                  style.top = top.toString()+"px";
                  style.transform = `scale(${scale})`;
                  style.zIndex = delHere*2;
                  thisBlock.setAttribute('spot',delHere.toString());
                  thisBlock.setAttribute('alt','hover-'+delHere.toString());
                  thisBlock.setAttribute('class','hoverBlock');
                  thisBlock.setAttribute('id','hoverBlock');
                  thisBlock.setAttribute('src','/blockdelete.png');
                  document.getElementById("islandHolder").appendChild(thisBlock);
                  break;

                }

                // let placeHere;
                // if(!this.isLeft && myIslandData[spot+ squareSize]!='00000001') placeHere = spot+squareSize+sideLength; //spot+squareSize+sideLength;
                // else if(this.isLeft && myIslandData[spot+ squareSize]!='00000001') placeHere = spot+squareSize+1;
                // else placeHere = spot+squareSize+sideLength+1;

                // if(myIslandData[placeHere]!='00000001') break;

            }*/