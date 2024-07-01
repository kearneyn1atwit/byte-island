import { mapGetters } from "vuex";

export default {
    data() {
        return {
            token: null,
            username: '',
            friends: [],
            friendSearch: '',
            friendVisited: false,
            visitedFriend: null,
            friendsProjects: [],
            friendsPosts: [],
            friendsData: 0,
            showReplyToPost: false,
            replyPost: null,
            reply: '',
        }
    },
    async created() {
        
    },
    computed: {
        ...mapGetters(['getUsername','getToken']),
        filteredFriends() {
            if(!this.friends) {
                return [];
            }
            if(!this.friendSearch) {
                return this.friends;
            }
            return this.friends.filter(friend => {
                return friend.username.toLowerCase().includes(this.friendSearch.toLowerCase()) 
            });
        }
    },
    mounted() {
        this.getUserDetails();
        this.getFriends();
    },
    methods: {
        getUserDetails() {
            this.token = this.getToken;
            this.username = this.getUsername;
        },
        //api call to get list of friends
        getFriends() {
            this.friends = [];
            for(let i=0; i<10; i++) {
                this.friends.push({
                    id: i,
                    username: 'Xx_coolguy93'+i+'_xX',
                    pfp: 'http://placebeard.it/250/250',
                    points: [i+45,i,i+27],
                    // friend island data for visiting them
                    island: 'island image',
                    friendsSince: new Date(new Date().setDate(new Date().getDate() - (42 * i))).toISOString()
                });
            }
        },
        //api call to handle visiting friend
        visit(friend) {
            this.friendVisited = true;
            this.visitedFriend = friend;
            this.$emit('visited-friend',friend);
            this.friendSearch = '';
            this.friendsProjects = [];
            // api call to get friends projects
            for(let i=0;i<8;i++) {
                this.friendsProjects.push({
                    id: i,
                    due: new Date().toISOString(),
                    points: [i+4,i,i+12],
                    title: "Friend project "+(i+1),
                    desc: 'Project description for friend project '+(i+1),
                    updates: [
                        {
                            id: i,
                            name: 'First update',
                            date: new Date().toISOString(),
                            desc: 'This is update '+(3*i+1)+'.'
                        },
                        {
                            id: i+1,
                            name: 'Update #2',
                            date: new Date().toISOString(),
                            desc: 'Update 2 here. And I have to admit, this is quite a long update description, let\'s see if it looks good on the website?'
                        }
                    ],
                    completed: i%2 === 0 ? 'incomplete' : new Date().toISOString()
                });
            }
            this.getFriendsPosts();
        },
        // api call to get friends posts
        getFriendsPosts() {
            this.friendsPosts = [];
            for(let i=0;i<6;i++) {
                this.friendsPosts.push({
                    id: i,
                    type: i%3 === 0 ? 'public' : 'friends',
                    hideReplies: false,
                    datetime: new Date().toISOString(),
                    user: this.visitedFriend.username,
                    text: i%3 === 0 ? 'This is a public post '+(i+1) : 'This is a friend post '+(i+1),
                    replies: i%2 === 0 ? [] : [
                        {
                            id: 0,
                            datetime: new Date().toISOString(),
                            user: 'DifferentUser'+(i+5),
                            text: 'This is a reply to the post '+(i+1)
                        },
                        {
                            id: 1,
                            datetime: new Date().toISOString(),
                            user: 'AnotherUser'+(i+54),
                            text: 'This is a different response to this post'
                        }
                    ]
                });
            }
        },
        replyToPost(post) {
            this.replyPost = post;
            this.showReplyToPost = true;
        },
        // api call to reply to post
        confirmReply(post) {
            post.replies.push({
                id: post.replies.length,
                datetime: new Date().toISOString(),
                user: this.username,
                text: this.reply
            });
            this.showReplyToPost = false;
            this.reply = '';
            // this.getFriendsPosts();
        },
        resetHideReplies() {
            for(let i=0;i<this.friendsPosts.length;i++) {
                this.friendsPosts[i].hideReplies = false;
            }
        },
        //api call to handle unfriending friend
        unfriend(friend) {
            this.$emit('unfriend-friend','Removed user from friend list: '+friend.username+'.');
            this.friends = this.friends.filter((item) => item !== friend);  
        }
    },
    components: {
      
    },
};