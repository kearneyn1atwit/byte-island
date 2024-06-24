import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import Notifications from "./Notifications";
import Projects from "./Projects";
import Search from "./Search";
import Requests from "./Requests";
import Editor from "./Editor";
import Friends from './Friends';

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
        _isLoggedIn: false
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
      // if(CryptoJS.AES.decrypt(this.$route.params.id,'123456').toString(CryptoJS.enc.Utf8) !== "password"){
      //   this.$router.push('/');
      // }
      else {
        this.loaded = true;
      }
      
    },
    computed: {
      ...mapGetters(['isLoggedIn','getUsername'])
    },
    mounted() {
      this.getNotificationsRequests();
      // refresh request count every minute
      setInterval(() => this.getNewNotificationsRequests(),60000);
    },
    methods: {
        ...mapMutations(['setToken']),
        //api call to get user data upon login
        getUserDetails() {
          this._isLoggedIn = this.isLoggedIn;
          this.username = this.getUsername;
          this.visitedUsername = this.username;
          this.pfp = 'https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250';
          this.rPoints = 0;
          this.gPoints = 12;
          this.bPoints = 6;
          // get island data
          this.island = null;
        },
        getNotificationsRequests() {
          // api call to get notifications/requests (get just list length)
          this.notificationCount = 7;
          this.readCount = 4;
          this.requestCount = 8;
          if(this.notificationCount > 0 && this.requestCount > 0) {
            this.showSuccessAlertFunc('Welcome back, '+this.username+'! You have '+this.notificationCount+' notification(s) and '+this.requestCount+' request(s).');
          }
          else if(this.notificationCount > 0 && this.requestCount === 0) {
            this.showSuccessAlertFunc('Welcome back, '+this.username+'! You have '+this.notificationCount+' notifcation(s).');
          }
          else if(this.notificationCount === 0 && this.requestCount > 0) {
            this.showSuccessAlertFunc('Welcome back, '+this.username+'! You have '+this.requestCount+' request(s).');
          }
          else {
            this.showSuccessAlertFunc('Welcome back, '+this.username+'!');
          }
        },
        // different function so "welcome back" text isn't shown every refresh, uses same api calls
        getNewNotificationsRequests() {
          let newNotificationsCount = 0;
          let newRequestsCount = 0;
          if(newNotificationsCount > 0 && newRequestsCount > 0) {
            this.notificationCount += newNotificationsCount;
            this.requestCount += newRequestsCount;
            this.showSuccessAlertFunc('You have '+newNotificationsCount+' new notification(s) and '+newRequestsCount+' new request(s)!');
          }
          else if(newNotificationsCount > 0 && newRequestsCount === 0) {
            this.notificationCount += newNotificationsCount;
            this.showSuccessAlertFunc('You have '+newNotificationsCount+' new notification(s)!');
          }
          else if(newNotificationsCount === 0 && newRequestsCount > 0) {
            this.requestCount += newRequestsCount;
            this.showSuccessAlertFunc('You have '+newRequestsCount+' new request(s)!');
          }
        },
        signOut() {
          // expire tokens
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
              this.return();
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
      Friends
    },
  };