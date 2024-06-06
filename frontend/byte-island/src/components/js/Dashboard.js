import CryptoJS from "crypto-js";
import Notifications from "./Notifications";
import Projects from "./Projects";
import Search from "./Search";

export default {
    data() {
      return {
        username: '',
        rPoints: 0,
        gPoints: 12,
        bPoints: 6,
        notifCount: 0,
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
      if(CryptoJS.AES.decrypt(this.$route.params.id,'123456').toString(CryptoJS.enc.Utf8) !== "password" || this.$route.params.username !== 'user'){
        this.$router.push('/not-found');
      }
      else {
        this.loaded = true;
      }
      
    },
    computed: {
      
    },
    mounted() {
      this.username = this.$route.params.username;
      this.getNotifications();
      // refresh notification count every minute
      setInterval(() => this.getNewNotifications(),60000);
    },
    methods: {
        getNotifications() {
          // api call to get notif count
          this.notifCount = 8;
          if(this.notifCount > 0) {
            this.showSuccessAlertFunc('Welcome back, '+this.username+'! You have '+this.notifCount+' notification(s).');
          }
          else {
            this.showSuccessAlertFunc('Welcome back, '+this.username+'!');
          }
          
        },
        // different function so "welcome back" text isn't shown every refresh, uses same api call
        getNewNotifications() {
          // if new notifications are received, show this alert
          let newNotifsCount = 0;
          this.notifCount += newNotifsCount;
          if(newNotifsCount > 0) {
            this.showSuccessAlertFunc('You have '+newNotifsCount+' new notification(s)!');
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
      Search
    },
  };