import CryptoJS from "crypto-js";
import { mapMutations } from "vuex";
import { mapGetters } from "vuex";
import Data from "../../data.json";

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
        errorAlertText: '',
        loaded: false
      };
    },
    async created() {
      
    },
    computed: {
      ...mapGetters(['getToken','getUsername'])
    },
    mounted() {
        // check if user is already logged in
        if(this.getToken !== null) {
          this.$router.push({ name: 'Home', params: {  
            id: this.getUsername
          }});
        }
        else {
          this.loaded = true;
        }
    },
    methods: {
      ...mapMutations(['setToken','setUser','setAccountStatus','setPoints','resetStore','setEmail','setPfp','setIsland']),
      //api call for logging in
      login() {
          this.resetStore();
          const hashedPassword = CryptoJS.SHA256(this.password).toString(CryptoJS.enc.Hex);

          fetch("http://"+Data.host+":5000/login", {
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
                else {
                  this.showErrorAlertFunc(response.statusText);
                  return;
                }
              }
              //console.log("Response was okay!");
              return response.json(); 
          })
          .then(data => {
            //console.log(data);
            // replace with data.email
            this.setEmail(this.email);
            // replace with data.pfp
            this.setPfp('https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250');
            this.setPfp(data.pfp);
            this.setAccountStatus(data.private);
            this.setToken(data.token);
            this.setUser(data.username);
            this.setPoints([data.career,data.personal,data.social]);
            //this.setIsland(data.island);
            //console.log('Login successful:', data.token); //This is the authorization token that must be stored
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
        this.resetStore();
        if(!this.showUsername) {
          this.showUsername = true;
        }
        else {

          //Hash password before making API call
          const hashedPassword = CryptoJS.SHA256(this.password).toString(CryptoJS.enc.Hex);

          fetch("http://"+Data.host+":5000/signup", {
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
                else {
                  this.showErrorAlertFunc(response.statusText);
                  return;
                }
              } else {
                return response.json(); 
              }
          })
          .then(data => {
            //console.log(data);
              // replace with data.email
              this.setEmail(this.email);
              // replace with data.pfp
              this.setPfp('https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250');
              this.setToken(data.token);
              this.setUser(data.username);
              this.setAccountStatus(data.private);
              this.setPoints([data.career,data.personal,data.social]);
              this.island(data.island);
              //console.log('Sign up successful:', data.token); //This is the authorization token that must be stored
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