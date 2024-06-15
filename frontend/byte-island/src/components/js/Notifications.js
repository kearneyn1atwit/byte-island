export default {
    props: ['notificationCount','readCount'],
    data() {
      return {
        notifications: []
      };
    },
    async created() {
      
    },
    computed: {
      filteredNotifications() {
        return this.notifications.sort(function(x,y){
            return x.read === y.read ? 0 : x.read ? 1 : -1;
        });
      }
    },
    mounted() {
        this.getNotifications();
    },
    methods: {
        // api call to get user notifications
        getNotifications() {
            this.notifications = [];
            for(let i=0;i<this.notificationCount + this.readCount;i++) {
                if(i < this.notificationCount){
                    this.notifications.push({
                        id: i,
                        read: false,
                        message: "Project X"+i+" is due soon! ("+new Date().toISOString()+")",
                        datetime: new Date().toISOString()
                    });
                }
                else {
                    this.notifications.push({
                        id: i,
                        read: true,
                        message: "User Y"+i+" has joined your network: Network "+(i+1)+"!",
                        datetime: new Date().toISOString()
                    });
                }
            }
        },
        // api call to update notification as read
        read(notification) {
            this.$emit('read-notification');
            notification.read = true;
        },
        // api call to remove notification
        del(notification) { 
            this.$emit('remove-notification');
            this.notifications = this.notifications.filter((item) => item !== notification);  
        },
        // api call to read all
        markAllRead() {
            for(let i=0;i<this.notifications.length;i++) {
                if(!this.notifications[i].read){
                    this.$emit('read-notification');
                    this.notifications[i].read = true;
                }
            }
        },
        // api call to delete all
        deleteAll() {
            this.notifications = [];
            this.$emit('remove-all-notifications');
        }
    },
    components: {
      
    },
  };