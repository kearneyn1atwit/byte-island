import CryptoJS from "crypto-js";

export default {
    data() {
      return {
        username: "",
        password: "",
        show: false,
        rules: {
            required: v => !!v || 'Field is required!'
        }
      };
    },
    async created() {
      
    },
    computed: {
      
    },
    mounted() {
        
    },
    methods: {
      login() {
        if(this.username !== '') {
          if(this.username === 'user' && this.password === 'password') {
            this.$router.push({ name: 'Home', params: { id: CryptoJS.AES.encrypt(this.password,'123456').toString()
             }});
          }
          else {
              alert("Invalid user credentials.");
          }
        }
      },
      wip() {
        alert("Feature not yet implemented.");
      }
    },
    components: {
      
    },
  };