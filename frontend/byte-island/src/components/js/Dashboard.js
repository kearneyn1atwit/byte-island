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
        token: null
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
      else {
        this.loaded = true;
      }
      
    },
    computed: {
      ...mapGetters(['isLoggedIn','getUsername','getToken','getDashboardCreateCount'])
    },
    mounted() {
      this.visitDashboard();
      this.getNotifications();
      this.getRequests();
      // only show welcome message when the user visited the dashboard after login
      if(this.getDashboardCreateCount === 1) {
        this.handleBadge();
      }
    },
    methods: {
        ...mapMutations(['setToken','visitDashboard','resetDashboardVisit']),
        //api call to get user data upon login
        getUserDetails() {
          this._isLoggedIn = this.isLoggedIn;
          this.token = this.getToken;
          this.username = this.getUsername;
          this.visitedUsername = this.username;
          this.pfp = 'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250';
          this.rPoints = 0;
          this.gPoints = 12;
          this.bPoints = 6;
          // get island data
          this.island = null;
        },
        getNotifications() {
          fetch("http://localhost:5000/notifications/"+this.username, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json', 
                  'Authorization': this.token
              }
          })
          .then(response => {
            console.log(response);
              if (!response.ok) {
                if(response.status === 401) {
                  //log out
                  this.$router.push('/');
                  this.setToken(null);
                }
              }
              console.log("Response was okay!");
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
          });
        },
        getRequests() {
          // api call to get requests (get just list length)
          this.requestCount = 8;
        },
        handleBadge() {
          if(this.notificationCount > 0 && this.requestCount > 0) {
            this.showSuccessAlertFunc('Welcome, '+this.username+'! You have '+this.notificationCount+' notification(s) and '+this.requestCount+' request(s).');
          }
          else if(this.notificationCount > 0 && this.requestCount === 0) {
            this.showSuccessAlertFunc('Welcome, '+this.username+'! You have '+this.notificationCount+' notifcation(s).');
          }
          else if(this.notificationCount === 0 && this.requestCount > 0) {
            this.showSuccessAlertFunc('Welcome, '+this.username+'! You have '+this.requestCount+' request(s).');
          }
          else {
            this.showSuccessAlertFunc('Welcome, '+this.username+'!');
          }
        },
        signOut() {
          // expire token
          this.resetDashboardVisit();
          this.setToken(null);
          this.$router.push('/');
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
              this.return();
            } else {
              this.widget = widget;
            }
            //if in Network view, go back to all networks
          } else if(this.$refs.networksRef) {
            if(this.$refs.networksRef.userVisited) {
              this.$refs.networksRef.userSearch = '';
              this.$refs.networksRef.userVisited = false;
              this.$refs.networksRef.usersData = 0;
              this.$refs.networksRef.networkVisited = true;
              this.return();
            }
            else if(this.$refs.networksRef.networkVisited) {
              this.$refs.networksRef.networkVisited = false;
              this.$refs.networksRef.userSearch = '';
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
        projectCompleted(text,rPoints,gPoints,bPoints) {
          this.showSuccessAlertFunc(text);
          this.rPoints += rPoints;
          this.gPoints += gPoints;
          this.bPoints += bPoints;
        },
        visitFriend(friend) {
          this.friendRPoints = friend.points[0];
          this.friendGPoints = friend.points[1];
          this.friendBPoints = friend.points[2];
          this.visitedUsername = friend.username;
          this.friendIsland = friend.island;
        },
        // return to users island
        return() {
          this.friendRPoints = -1;
          this.getUserDetails();
        },
        wip() {
            alert("Feature not yet implemented.");
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