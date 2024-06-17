import CryptoJS from "crypto-js";
import Notifications from "./Notifications";
import Projects from "./Projects";
import Search from "./Search";
import Requests from "./Requests";
import Editor from "./Editor"

export default {
    data() {
      return {
        username: '',
        rPoints: 0,
        gPoints: 12,
        bPoints: 6,
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
        warningAlertText: ''
      };
    },
    async created() {
      // change to real authentication later
      if(CryptoJS.AES.decrypt(this.$route.params.id,'123456').toString(CryptoJS.enc.Utf8) !== "password"){
        this.$router.push('/not-found');
      }
      else {
        this.loaded = true;
      }
      
    },
    computed: {
      
    },
    mounted() {
      this.getUsername();
      this.getNotificationsRequests();
      // refresh request count every minute
      setInterval(() => this.getNewNotificationsRequests(),60000);
    },
    methods: {
        //api call to get username from email
        getUsername() {
          this.username = 'user';
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
          // expire token
          this.$router.push({name: 'Login'});
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
        wip() {
            alert("Feature not yet implemented.");
        }
    },
    components: {
      Notifications,
      Projects,
      Search,
      Requests,
      Editor
    },
  };