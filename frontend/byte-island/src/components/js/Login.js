import CryptoJS from "crypto-js";
import { mapMutations } from "vuex";

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
      ...mapMutations(['setToken','setUser','setPoints','resetStore']),
      //api call for logging in
      login() {

          const hashedPassword = CryptoJS.SHA256(this.password).toString(CryptoJS.enc.Hex);

          fetch("http://localhost:5000/login", {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json', 
              },
              body: JSON.stringify({
                email: this.email,
                password: hashedPassword
              }) 
          })
          .then(response => {
              if (!response.ok) {
                if(response.status === 401) {
                  //log out
                  this.$router.push('/');
                  this.resetStore();
                }
              }
              console.log("Response was okay!");
              return response.json(); 
          })
          .then(data => {
            this.setToken(data.token);
            this.setUser(data.username);
            this.setPoints([data.career,data.personal,data.social]);
            console.log('Login successful:', data.token); //This is the authorization token that must be stored
              this.$router.push({ name: 'Home', params: {  
                id: data.username
              }});
          })
          .catch(error => {
              console.error('Error logging in:', error);
              this.showErrorAlertFunc('Invalid email or password.');
          });
      },
      //api call for signing up
      signup() {
        if(!this.showUsername) {
          this.showUsername = true;
        }
        else {

          //Hash password before making API call
          const hashedPassword = CryptoJS.SHA256(this.password).toString(CryptoJS.enc.Hex);

          fetch("http://localhost:5000/signup", {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json', 
              },
              body: JSON.stringify({
                username: this.username,
                email: this.email,
                password: hashedPassword
              }) 
          })
          .then(response => {
              if (!response.ok) {
                if(response.status === 401) {
                  //log out
                  this.$router.push('/');
                  this.resetStore();
                }
              } else {
                return response.json(); 
              }
          })
          .then(data => {
              this.setToken(data.token);
              this.setUser(data.username);
              this.setPoints([data.career,data.personal,data.social]);
              console.log('Sign up successful:', data.token); //This is the authorization token that must be stored
              this.$router.push({ name: 'Home', params: { 
                id: data.username
               }});
          })
          .catch(error => {
              console.error('Error signing up:', error);
              this.showErrorAlertFunc('Error signing up.');
          });
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