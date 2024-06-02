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
        if(this.username === 'user' && this.password === 'password') {
            this.$router.push('/test-page');
        }
        else {
            alert("Invalid user credentials.");
        }
      }
    },
    components: {
      
    },
  };