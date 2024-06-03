import CryptoJS from "crypto-js";
import Notifications from "./Notifications";
import Projects from "./Projects";

export default {
    data() {
      return {
        rPoints: 0,
        gPoints: 12,
        bPoints: 6,
        notifCount: 0,
        drawer: false,
        loaded: false,
        widget: "dashboard",
        showSignOut: false
      };
    },
    async created() {
      if(CryptoJS.AES.decrypt(this.$route.params.id,'123456').toString(CryptoJS.enc.Utf8) !== "password"){
        this.$router.push("/unauthorized");
      }
      else {
        this.loaded = true;
      }
      
    },
    computed: {
      
    },
    mounted() {
      this.getNotifications();
    },
    methods: {
        getNotifications() {
          // api call to get notif count, add timeout every x seconds/minutes to refresh?
          this.notifCount = 20;
        },
        signOut() {
          // expire token
          this.$router.push({name: 'Login'});
        },
        toWidget(widget) {
          this.widget = widget;
        },
        wip() {
            alert("Feature not yet implemented.");
        }
    },
    components: {
      Notifications,
      Projects
    },
  };