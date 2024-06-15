import CryptoJS from "crypto-js";

export default {
    data() {
      return {
        username: "",
        showUsername: false,
        email: "",
        password: "",
        show: false,
        valid: false,
        rules: {
            required: v => !!v || 'Field is required!',
            emailRules: v => /.+@.+/.test(v) || 'Invalid email address!'
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
          if(this.email === 'user@a.com' && this.password === 'password') {
            this.$router.push({ name: 'Home', params: { 
              id: CryptoJS.AES.encrypt(this.password,'123456').toString()
             }});
          }
          else {
              this.showErrorAlertFunc('Invalid email or password.');
          }
      },
      //api call for signing up
      signup() {
        if(!this.showUsername) {
          this.showUsername = true;
        }
        else {
          // api call for signing up here
          this.$router.push({ name: 'Home', params: { 
            id: CryptoJS.AES.encrypt(this.password,'123456').toString()
           }});
        }
      },
      showErrorAlertFunc(text) {
        this.errorAlertText = text;
        this.showErrorAlert = true;
        setTimeout(() => this.hideAlerts(),4000);
      },
      hideAlerts() {
        this.showErrorAlert = false;
        this.errorAlertText = '';
      }
    },
    components: {
      
    },
  };