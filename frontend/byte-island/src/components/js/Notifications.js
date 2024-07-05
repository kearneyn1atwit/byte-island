import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

export default {
    data() {
      return {
        token: null,
        username: '',
        notifications: [],
        loaded: false
      };
    },
    async created() {
      
    },
    computed: {
      ...mapGetters(['getToken','getUsername']),
      filteredNotifications() {
        if(this.notifications.length > 0){
            return this.notifications.sort(function(x,y){
                return x.Read === y.Read ? 0 : x.Read ? 1 : -1;
            });
        }
        return [];
      }
    },
    mounted() {
        this.getUserDetails();
        this.getNotifications();
    },
    methods: {
        ...mapMutations(['setToken','resetStore']),
        getUserDetails() {
            this.token = this.getToken;
            this.username = this.getUsername;
        },
        // api call to get user notifications
        getNotifications() {
            fetch("http://localhost:5000/notifications/"+this.username, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                }
            })
            .then(response => {
                if (!response.ok) {
                    if(response.status === 401) {
                        //log out
                        this.$router.push('/');
                        this.resetStore();
                      }
                }
                return response.json(); 
            })
            .then(data => {
              this.notifications = data;
              this.loaded = true;
            })
            .catch(error => {
                console.error('Error with Notifications API:', error);
                this.loaded = true;
            });
        },
        // api call to update notification as read (DONE)
        read(notification) {
            fetch("http://localhost:5000/notifications", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    notificationId: notification.Id,
                    username: this.username
                  }) 
            })
            .then(response => {
                this.getNotifications();
                this.$emit('get-notifications');
            })
            .catch(error => {
                console.error('Error with Notifications API:', error);
            });
        },
        // api call to remove notification (DONE)
        del(notification) { 
            fetch("http://localhost:5000/notifications", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    notificationId: notification.Id,
                    username: this.username
                  }) 
            })
            .then(response => {
                this.getNotifications();
                this.$emit('get-notifications');
            })
            .catch(error => {
                console.error('Error with Notifications API:', error);
            }); 
        },
        // api call to read all (DONE)
        markAllRead() {
            fetch("http://localhost:5000/notifications", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    notificationId: -1,
                    username: this.username
                  }) 
            })
            .then(response => {
                this.getNotifications();
                this.$emit('get-notifications');
            })
            .catch(error => {
                console.error('Error with Notifications API:', error);
            });
        },
        // api call to delete all (DONE)
        deleteAll() {
            fetch("http://localhost:5000/notifications", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    notificationId: -1,
                    username: this.username
                  }) 
            })
            .then(response => {
                this.getNotifications();
                this.$emit('get-notifications');
            })
            .catch(error => {
                console.error('Error with Notifications API:', error);
            });
        }
    },
    components: {
      
    },
  };