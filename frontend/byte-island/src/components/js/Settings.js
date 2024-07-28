import CryptoJS from "crypto-js";
import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import Data from "../../data.json";

export default {
    data() {
        return {
            base64Img: '',
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
        ...mapMutations(['setAccountStatus','setUser','setToken','setEmail','setPfp','resetStore']),
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
            fetch("http://"+Data.host+":5000/settings", {
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
            fetch("http://"+Data.host+":5000/settings", {
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
            if(this.enterPassword === this.newPassword) {
                this.$emit('settings-warning','Warning: Passwords match.');
                return;
            }
            const hashedEnter = CryptoJS.SHA256(this.enterPassword).toString(CryptoJS.enc.Hex);
            const hashedNew = CryptoJS.SHA256(this.newPassword).toString(CryptoJS.enc.Hex);

            fetch("http://"+Data.host+":5000/settings", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                  setting: 'password',
                  value: hashedNew,
                //   password: hashedEnter
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
                this.$emit('settings-success','Password successfully changed.');
                this.showPassword = false;
                this.enterPassword = '';
                this.newPassword = '';
                this.showEnter = false;
                this.showNew = false;
            })
            .catch(error => {
                this.showPassword = false;
                this.enterPassword = '';
                this.newPassword = '';
                this.showEnter = false;
                this.showNew = false;
                console.error('Error with Settings API:', error);
                this.$emit('settings-error',error);
            });
        },
        //api call to change profile picture
        changeAvatar() {
            this.$refs.pfp.click();
            let self = this;
            document.getElementById('pfp').addEventListener('change', function(e) {
                if (e.target.files[0]) {
                  if(e.target.files[0].size > 10240) {
                    self.$emit('settings-warning','File size limit is 10KB.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = () => {
                    self.base64Img = reader.result;
                    fetch("http://"+Data.host+":5000/settings", {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json', 
                            'Authorization': self.token
                        },
                        body: JSON.stringify({
                          username: self.username,
                          setting: 'avatar',
                          value: self.base64Img.substring(23)
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
                          self.setPfp(self.base64Img.substring(23));
                          self.$emit('settings-success','Avatar successfully changed.'); 
                          // self.getUserDetails();
                          self.$emit('get-dash-data');
                      })
                      .catch(error => {
                          console.error('Error with Settings API:', error);
                          self.$emit('settings-error',error);
                      });
                  }
                  reader.readAsDataURL(e.target.files[0]);
                }
            });
        },
        privateAccount() {
            this.showPrivateDialog = true;
        },
        //api call to private account
        confirmPrivate() {
            fetch("http://"+Data.host+":5000/settings", {
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
            fetch("http://"+Data.host+":5000/settings", {
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
            const hashedDel = CryptoJS.SHA256(this.confirmDeletePassword).toString(CryptoJS.enc.Hex);

            fetch("http://"+Data.host+":5000/users", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                  username: this.username,
                //   password: hashedDel
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
                //log out
                this.$router.push('/');
                this.resetStore();
            })
            .catch(error => {
                console.error('Error with Users API:', error);
                this.$emit('settings-error',error);
            });
        },
        wip() {
            alert('Feature not yet implemented.');
        }
    },
    emits: ['settings-error','settings-success','settings-warning','get-dash-data'],
    components: {
      
    },
};