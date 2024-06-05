export default {
    props: ['notifCount'],
    data() {
      return {
        notifications: []
      };
    },
    async created() {
      
    },
    computed: {
      
    },
    mounted() {
        this.getNotifications();
    },
    methods: {
        // api call to get user notifications
        getNotifications() {
            for(let i=0;i<this.notifCount;i++) {
                if(i % 2 === 0){
                    this.notifications.push({
                        id: i,
                        type: "friend",
                        messageBody: {
                            message: "User "+i+" sent a friend request",
                            user: 'User '+i
                        },
                        time: "12:58 PM"
                    });
                }
                else {
                    this.notifications.push({
                        id: i,
                        type: "network",
                        messageBody: {
                            message: "User "+i+" wants to join your network: \"Network "+(i+1)+"\"",
                            user: 'User '+i,
                            network: 'Network '+(i+1)
                        },
                        time: "11:52 PM"
                    });
                }
            }
        },
        wip() {
            alert("Feature not yet implemented.");
        },
        accept(notification) {
            // api call to accept notification
            this.$emit('remove-notif');
            this.notifications = this.notifications.filter((item) => item !== notification);
            if(notification.type === 'friend'){
                this.$emit('notification-success','You have a new friend: '+notification.messageBody.user+'!');
            }
            else if(notification.type === 'network') {
                this.$emit('notification-success',notification.messageBody.user+' has joined '+notification.messageBody.network);
            }
        },
        ignore(notification) {
            // api call to remove notification
            this.$emit('remove-notif-event');
            this.notifications = this.notifications.filter((item) => item !== notification);  
        }
    },
    components: {
      
    },
  };