import { mapGetters } from "vuex";

export default {
    data() {
        return {
            username: '',
            newUsername: '',
            token: null,
            showUsername: false,
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
        ...mapGetters(['getToken','getUsername']),
    },
    mounted() {
        this.getUserDetails();
    },
    methods: {
        getUserDetails() {
            this.username = this.getUsername;
            this.token = this.getToken;
            this.newUsername = this.username;
        },
        changeUsername() {
            this.showUsername = true;
        },
        //api call to change username
        confirmUsername() {
            this.wip();
            this.showUsername = false;
            this.newUsername = this.username;
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
        },
        privateAccount() {
            this.showPrivateDialog = true;
        },
        //api call to private account
        confirmPrivate() {
            this.wip();
            this.showPrivateDialog = false;
        },
        publicAccount() {
            this.showPublicDialog = true;
        },
        //api call to publicize account
        confirmPublic() {
            this.wip();
            this.showPublicDialog = false;
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
    components: {
      
    },
};