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
                this.notifications.push({
                    id: i,
                    messageBody: ("User "+i+" wants to join your <network "+(i+1)+"> network"),
                    time: "11:52 PM"
                });
            }
        },
        wip() {
            alert("Feature not yet implemented.");
        },
        accept(notification) {
            // api call to accept notification
            this.$emit('remove-notif-event');
            this.notifications = this.notifications.filter((item) => item !== notification);
            alert('Notification accepted.');
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