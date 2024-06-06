import CryptoJS from "crypto-js";

export default {
    data() {
      return {
        username: "",
        password: "",
        show: false,
        rules: {
            required: v => !!v || 'Field is required!'
        },
        showErrorAlert: false,
        errorAlertText: ''
      };
    },
    async created() {
      
    },
    computed: {
      
    },
    mounted() {
        
    },
    methods: {
      //api call for logging in
      login() {
          if(this.username === 'user' && this.password === 'password') {
            this.$router.push({ name: 'Home', params: { 
              id: CryptoJS.AES.encrypt(this.password,'123456').toString(),
              username: this.username
             }});
          }
          else {
              this.showErrorAlertFunc('Invalid username or password.');
          }
      },
      //api call for signing up
      signup() {
        this.wip();
      },
      showErrorAlertFunc(text) {
        this.errorAlertText = text;
        this.showErrorAlert = true;
        setTimeout(() => this.hideAlerts(),4000);
      },
      hideAlerts() {
        this.showErrorAlert = false;
        this.errorAlertText = '';
      },
      wip() {
        alert("Feature not yet implemented.");
      }
    },
    components: {
      
    },
  };