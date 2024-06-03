export default {
    data() {
      return {
        projects: [],
        projectSearch: ''
      };
    },
    async created() {
      
    },
    computed: {
      filteredProjects() {
        return this.projects.filter(project => {
            return project.title.toLowerCase().includes(this.projectSearch.toLowerCase()) 
        });
      }
    },
    mounted() {
        this.getProjects();
    },
    methods: {
        //api call to get user projects
        getProjects() {
            for(let i=0;i<5;i++) {
                this.projects.push({
                    id: i,
                    due: "4/1/2025",
                    points: [i,i+12,i+3],
                    title: "Project "+(i+1),
                    updates: [
                        {
                            id: 3*i+0,
                            name: 'First update',
                            date: '3/1/24',
                            desc: 'This is update '+(3*i+1)+'.'
                        },
                        {
                            id: 3*i+1,
                            name: 'Update #2',
                            date: '7/17/24',
                            desc: 'Update 2 here. And I have to admit, this is quite a long update description, let\'s see if it looks good on the website?'
                        },
                        {
                            id: 3*i+2,
                            name: 'Most recent',
                            date: '2/7/25',
                            desc: 'The final update.'
                        }
                    ]
                });
            }
        },
        done(project) {
            this.wip();
        },
        edit(project) {
            this.wip();
        },
        del (project) {
            this.wip();
        },
        wip() {
            alert("Feature not yet implemented.");
        }
    },
    components: {
      
    },
  };