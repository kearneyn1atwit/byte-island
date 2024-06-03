import CryptoJS from "crypto-js";
import Notifications from "./Notifications";

export default {
    data() {
      return {
        rPoints: 0,
        gPoints: 12,
        bPoints: 6,
        notifCount: 0,
        drawer: false,
        loaded: false,
        widget: "dashboard"
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
          // api call to get notif count
          this.notifCount = 20;
        },
        toWidget(widget) {
          this.widget = widget;
        },
        wip() {
            alert("Feature not yet implemented.");
        }
    },
    components: {
      Notifications
    },
  };