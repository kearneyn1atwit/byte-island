import CryptoJS from "crypto-js";

export default {
    data() {
      return {
        rPoints: 0,
        gPoints: 12,
        bPoints: 6,
        notifCount: 2,
        drawer: null,
        loaded: false
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

    },
    methods: {
        wip() {
            alert("Feature not yet implemented.");
        }
    },
    components: {
      
    },
  };