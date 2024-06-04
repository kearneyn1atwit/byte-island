export default {
    data() {
      return {
        projects: [],
        projectSearch: '',
        projectView: 'all',
        newTitle: '',
        newDesc: '',
        rules: {
            required: v => !!v || 'Field is required!'
        },
        aiFeedbackText: 'No description provided.',
        newRPoints: 0,
        newGPoints: 0,
        newBPoints: 0,
        newDueDate: 'N/A',
        overrideDueDate: '',
        todayDate: ''
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
        let todayArray = new Date().toLocaleDateString().split("/");
        let year = todayArray[2];
        let month = todayArray[0];
        let day = todayArray[1];
        if(parseInt(month) < 10) {
            month = '0' + month;
        }
        if (parseInt(day) < 10) {
            day = '0' + day;
        }
        this.todayDate = year+'-'+month+'-'+day;
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
                    desc: 'Project description for project '+i,
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
        resetData() {
            this.projectSearch = '';
            this.projectView = 'all';
            this.newTitle = '';
            this.newDesc = '';
            this.aiFeedbackText = 'No description provided.';
            this.newRPoints = 0;
            this.newGPoints = 0;
            this.newBPoints = 0;
            this.newDueDate = 'N/A';
            this.overrideDueDate = '';
        },
        newProject() {
            this.projectView = 'new';
        },
        // handle AI feedback
        aiFeedback() {
            if(this.newDesc) {
                this.aiFeedbackText = 'This description is adequate!';
                if(this.newDesc.length % 6 === 1) {
                    this.newRPoints++;
                }
                else if(this.newDesc.length % 6 === 2) {
                    this.newGPoints++;
                }
                else if(this.newDesc.length % 6 === 3) {
                    this.newBPoints++;
                }
                let d = new Date();
                d.setDate(d.getDate() + 1);
                this.newDueDate = d.toLocaleDateString();
            }
            else {
                this.newRPoints = 0;
                this.newGPoints = 0;
                this.newBPoints = 0;
                this.aiFeedbackText = 'No description provided.';
                this.newDueDate = 'N/A';
            }
        },
        // api call to handle project creation
        createProject() {
            // handle if project name already exists
            for(let i=0;i<this.projects.length;i++) {
                if(this.newTitle === this.projects[i].title) {
                    this.$emit('project-error','Error: A project with name \"'+this.newTitle+'\" already exists.');
                    return;
                }
            }
            let finalDate = this.newDueDate;
            if(this.overrideDueDate) {
                finalDate = new Date(this.overrideDueDate);
                finalDate.setDate(finalDate.getDate() + 1);
                finalDate = finalDate.toLocaleDateString();
            }
            this.projects.push({
                id: this.projects.length,
                due: finalDate,
                points: [this.newRPoints,this.newGPoints,this.newBPoints],
                title: this.newTitle,
                desc: this.newDesc,
                updates: []
            });
            this.$emit('project-created',this.newTitle + ' successfully created.');
            this.resetData();
        },
        // api call to handle done project
        done(project) {
            this.wip();
        },
        // api call to handle edit project
        edit(project) {
            this.wip();
        },
        // api call to handle delete project
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