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
        islandData: null,
        showBackToIsland: false,
        pseudoDatabase: [
          {
              id: "000",
              name: "nil",
              RGB: 1,
              image: "/000.png",
          },
          {
              id: "001",
              name: "air",
              RGB: 1,
              image: "/001.png",
          },
          {
              id: "002",
              name: "simple block",
              RGB: 10000,
              image: "/002.png",
          },
          {
              id: "003",
              name: "blue block",
              RGB: 1,
              image: "/003.png",
          },
          {
              id: "004",
              name: "green block",
              RGB: 100,
              image: "/004.png"
          }]
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
        //Used Claude to generate code to figure out if something is inside a parrallelogram, used to determine if mouse is within range to place a block.
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
          return Math.floor((Math.sqrt(altY**2+altX**2)/2)/53.778);
        },
        leftOrRight(pX,onesPlace,eightsPlace) {
          const shift = eightsPlace-onesPlace;
          return pX < shift*48.5 + 482;
        },
        canIPlaceHere(x,y) {
          if(this.$refs.editorRef && this.$refs.editorRef.editorView === 'inventory') {
            //const space = 32;
            //const scale = 1.5;
            const baseCoords = [482,324,100,518,482,714,866,518];
            const indeces = [];
            for(var plane=0;plane<6;plane++) {
              const offset = plane*48; //48 = scale*space, set to 1.5 and 32.
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
          for(var x=this.indeces.length-1;x>=0;x--) {
            const spot = this.indeces[x];
            if(myIslandData[spot]!='00000001' && myIslandData[spot+64]==='00000001' && this.getSelectedBlock) {
              //if((myIslandData[spot+73]==='00000001') && (!this.isLeft || myIslandData[spot+65]==='00000001') && (this.isLeft || myIslandData[spot+72]==='00000001')) {
                const scale = 1.5;
                const space = 32;
                const sideLength = 8;
                const xStart = 450;
                const yStart = 340;
                if(this.getSelectedBlock==='DEL' && myIslandData[spot]!='00000000') {
                  let thisBlock = document.createElement('img');
                  let style = thisBlock.style;
                  style.position = 'absolute';
                  const control = spot%(sideLength*sideLength);
                  const offset = -1*(scale*space)*(Math.floor(spot/(sideLength*sideLength)))+(Math.floor(spot/(sideLength*sideLength)))+1;
                  const left = xStart + ((scale*space)*((control%sideLength*-1)+Math.floor(control/sideLength)));
                  const top = yStart + offset + ((scale*space/2)*((control%sideLength)+Math.floor(control/sideLength)));
                  style.left = left.toString()+"px";
                  style.top = top.toString()+"px";
                  style.transform = `scale(${scale})`;
                  style.zIndex = spot*2;
                  thisBlock.setAttribute('spot',spot.toString());
                  thisBlock.setAttribute('src','/blockdelete.png');
                  thisBlock.setAttribute('alt','hover-'+spot.toString());
                  thisBlock.setAttribute('class','hoverBlock');
                  thisBlock.setAttribute('id','hoverBlock');
                  document.getElementById("islandHolder").appendChild(thisBlock);
                  break;
                } else if(this.getSelectedBlock!='DEL' && spot<256) {
                  let thisBlock = document.createElement('img');
                  let style = thisBlock.style;
                  style.position = 'absolute';
                  const control = spot%(sideLength*sideLength);
                  const offset = -1*(scale*space)*(Math.floor(spot/(sideLength*sideLength))+1)+(Math.floor(spot/(sideLength*sideLength)))+1;
                  const left = xStart + ((scale*space)*((control%sideLength*-1)+Math.floor(control/sideLength)));
                  const top = yStart + offset + ((scale*space/2)*((control%sideLength)+Math.floor(control/sideLength)));
                  style.left = left.toString()+"px";
                  style.top = top.toString()+"px";
                  style.transform = `scale(${scale})`;
                  style.zIndex = spot*2;
                  thisBlock.setAttribute('spot',spot.toString());
                  thisBlock.setAttribute('src','/blockplace.png');
                  thisBlock.setAttribute('alt','hover-'+spot.toString());
                  thisBlock.setAttribute('class','hoverBlock');
                  thisBlock.setAttribute('id','hoverBlock');
                  document.getElementById("islandHolder").appendChild(thisBlock);
                  break;
                }
              //}
            }
          }
        },
        alterIsland(event) {
          if(document.getElementById('hoverBlock')) {
            if(this.getSelectedBlock==='DEL') {
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
              thisBlock.setAttribute('src','/001.png');
              thisBlock.setAttribute('alt','block-'+(spot).toString());
              thisBlock.setAttribute('class','placeableBlock');
              thisBlock.setAttribute('id','block-'+(spot).toString());
              this.islandData[spot] = '00000001';
              this.updateIsland({index: spot, newData:'00000001'});
              document.getElementById('block-'+(spot)).remove();
              document.getElementById("islandHolder").appendChild(thisBlock);
              document.getElementById('hoverBlock').remove();
            } else {
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
              thisBlock.setAttribute('src','/'+this.getSelectedBlock+".png");
              thisBlock.setAttribute('alt','block-'+(spot+64).toString());
              thisBlock.setAttribute('class','placeableBlock');
              thisBlock.setAttribute('id','block-'+(spot+64).toString());
              this.islandData[spot+64] = '00000002';
              this.updateIsland({index: spot+64, newData: '00000002'});
              document.getElementById('block-'+(spot+64)).remove();
              document.getElementById("islandHolder").appendChild(thisBlock);
            }
          }
        },
        //api call to get user data upon login
        genIsland() {
          //let blockArray = document.getElementsByClassName("placeableBlock");
          let islandDiv = document.getElementById("islandHolder");
          for(var x=0;x<320;x++) {
            let delBlock = document.getElementById('block-'+x.toString());
            if(delBlock) delBlock.remove();
          }
          this.clearIsland();
          let counter = 0;
          const scale = 1.5;
          const space = 32;
          const sideLength = 8;
          const xStart = 450;
          const yStart = 340;
          const myIslandData = this.getIslandData;
          this.islandData = myIslandData;
          for(var index in myIslandData) {
              index = Number(index);
              let block = myIslandData[index];
              let id = Number(block);
              let thisBlock = document.createElement('img');
              let style = thisBlock.style;
              style.position = 'absolute';
              const control = counter%(sideLength*sideLength);
              const offset = -1*(scale*space)*Math.floor(counter/(sideLength*sideLength))+(Math.floor(counter/(sideLength*sideLength)))+1;
              const left = xStart + ((scale*space)*((control%sideLength*-1)+Math.floor(control/sideLength)));
              const top = yStart + offset + ((scale*space/2)*((control%sideLength)+Math.floor(control/sideLength)));
              style.left = left.toString()+"px";
              style.top = top.toString()+"px";
              style.transform = `scale(${scale})`;
              style.zIndex = counter*2;
              thisBlock.setAttribute('src',this.pseudoDatabase[id].image);
              thisBlock.setAttribute('alt',block+'-'+counter.toString());
              thisBlock.setAttribute('class','placeableBlock');
              thisBlock.setAttribute('id','block-'+counter.toString());
              // if(id!=1 && index+64<320 && myIslandData[index+64]==="00000001") {
              //   let hoverBlock = document.createElement('img');
              //   let hoverStyle = hoverBlock.style;
              //   hoverStyle.position = 'absolute';
              //   hoverStyle.left = left.toString()+"px";
              //   hoverStyle.top = (top-(scale*space)).toString()+"px";
              //   //hoverStyle.top = top.toString()+"px";
              //   hoverStyle.transform = `scale(${scale})`;
              //   hoverStyle.opacity = 0;
              //   hoverStyle.transition = 'opacity 0.1s ease';
              //   hoverBlock.setAttribute('src',"/blockplace.png");
              //   hoverBlock.setAttribute('alt','hover-'+counter.toString()); 
              //   hoverBlock.setAttribute('id','hover-'+counter.toString()); 
              //   hoverBlock.addEventListener("clear", (event) => {
              //     hoverStyle.opacity = 0;
              //   });
              //   elementArray[counter+64]=hoverBlock;
              // }
              islandDiv.appendChild(thisBlock);
              counter++;
          }
        },
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
          return fetch("http://localhost:5000/notifications/"+this.username, {
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
          return fetch("http://localhost:5000/requests/"+this.username+"/user/open", {
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
          return fetch("http://localhost:5000/requests/"+this.username+"/network/open", {
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