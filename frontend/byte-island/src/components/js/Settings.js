import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

export default {
    data() {
        return {
            accountStatus: false,
            username: '',
            newUsername: '',
            email: '',
            newEmail: '',
            token: null,
            showUsername: false,
            showEmail: false,
            showPassword: false,
            enterPassword: '',
            newPassword: '',
            showEnter: false,
            showNew: false,
            showPrivateDialog: false,
            showPublicDialog: false,
            confirmDeletePassword: '',
            showEnterDelete: false,
            showDelete: false
        }
    },
    async created() {
        
    },
    computed: {
        ...mapGetters(['getToken','getUsername','getAccountStatus','getEmail']),
    },
    mounted() {
        this.getUserDetails();
    },
    methods: {
        ...mapMutations(['setAccountStatus','setUser','setToken','setEmail','setPfp']),
        getUserDetails() {
            this.username = this.getUsername;
            this.token = this.getToken;
            this.newUsername = this.username;
            this.email = this.getEmail;
            this.newEmail = this.email;
            this.accountStatus = this.getAccountStatus;
        },
        changeUsername() {
            this.showUsername = true;
        },
        changeEmail() {
            this.showEmail = true;
        },
        //api call to change username
        confirmUsername() {
            fetch("http://localhost:5000/settings", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                  setting: 'username',
                  value: this.newUsername
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
                        this.$emit('settings-error',response.statusText);
                        return;
                    }
                }
                return response.json();
            })
            .then(data =>{
                this.showUsername = false;
                this.setUser(this.newUsername);
                this.setToken(data.token);
                this.$emit('settings-success','Username successfully changed to '+this.newUsername+'.'); 
                this.getUserDetails();
                this.$emit('get-dash-data');
                history.pushState({},null,this.username);
            })
            .catch(error => {
                console.error('Error with Settings API:', error);
                this.$emit('settings-error',error);
            });
        },
        //api call to change email
        confirmEmail() {
            fetch("http://localhost:5000/settings", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                  setting: 'email',
                  value: this.newEmail
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
                        this.$emit('settings-error',response.statusText);
                        return;
                    }
                }
                this.showEmail = false;
                this.setEmail(this.newEmail);
                this.$emit('settings-success','Email successfully changed to '+this.newEmail+'.'); 
                this.getUserDetails();
            })
            .catch(error => {
                console.error('Error with Settings API:', error);
                this.$emit('settings-error',error);
            });
        },
        changePassword() {
            this.showPassword = true;
        },
        //api call to confirm password
        confirmPassword() {
            this.wip();
            this.showPassword = false;
            this.enterPassword = '';
            this.newPassword = '';
            this.showEnter = false;
            this.showNew = false;
        },
        //api call to change profile picture
        changeAvatar() {
            this.$refs.pfp.click();
            let self = this;
            document.getElementById('pfp').addEventListener('change', function(e) {
                if (e.target.files[0]) {
                  fetch("http://localhost:5000/settings", {
                      method: 'PUT',
                      headers: {
                          'Content-Type': 'application/json', 
                          'Authorization': self.token
                      },
                      body: JSON.stringify({
                        username: self.username,
                        setting: 'avatar',
                        value: e.target.files[0].name
                      }) 
                    })
                    .then(response => {
                        if (!response.ok) {
                            if(response.status === 401) {
                                //log out
                                self.$router.push('/');
                                self.resetStore();
                            }
                            else {
                                self.$emit('settings-error',response.statusText);
                                return;
                            }
                        }
                        self.setPfp(e.target.files[0].name);
                        self.$emit('settings-success','Avatar successfully changed.'); 
                        // self.getUserDetails();
                        self.$emit('get-dash-data');
                    })
                    .catch(error => {
                        console.error('Error with Settings API:', error);
                        self.$emit('settings-error',error);
                    });
                }
            });
        },
        privateAccount() {
            this.showPrivateDialog = true;
        },
        //api call to private account
        confirmPrivate() {
            fetch("http://localhost:5000/settings", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                  setting: 'status',
                  value: 'private'
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
                        this.$emit('settings-error',response.statusText);
                        return;
                    }
                }
                this.showPrivateDialog = false;
                this.setAccountStatus(true);
                this.$emit('settings-success','Your account is now private.'); 
                this.getUserDetails();
            })
            .catch(error => {
                console.error('Error with Settings API:', error);
                this.$emit('settings-error',error);
            });
        },
        publicAccount() {
            this.showPublicDialog = true;
        },
        //api call to publicize account
        confirmPublic() {
            fetch("http://localhost:5000/settings", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                  setting: 'status',
                  value: 'public'
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
                        this.$emit('settings-error',response.statusText);
                        return;
                    }
                }
                this.showPublicDialog = false;
                this.setAccountStatus(false);
                this.$emit('settings-success','Your account is now public.'); 
                this.getUserDetails();
            })
            .catch(error => {
                console.error('Error with Settings API:', error);
                this.$emit('settings-error',error);
            });
        },
        deleteAccount() {
            this.showDelete = true;
        },
        //api call to delete account
        confirmDelete() {
            this.wip();
            this.showDelete = false;
            this.confirmDeletePassword = '';
            this.showEnterDelete = false;
        },
        wip() {
            alert('Feature not yet implemented.');
        }
    },
    emits: ['settings-error','settings-success','get-dash-data'],
    components: {
      
    },
};