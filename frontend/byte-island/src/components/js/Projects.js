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
        todayDate: '',
        showDel: false,
        editProject: null,
        editProjectTitle: '',
        editProjectDesc: '',
        editProjectDueDate: '',
        editProjectUpdateTitle: '',
        editProjectUpdateDesc: '',
        delProject: null
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
        this.todayDate = new Date().toISOString();
        this.getProjects();
    },
    methods: {
        // convert date to text field model friendly
        convertDate(date) {
            let todayArray = date.split("/");
            let year = todayArray[2];
            let month = todayArray[0];
            let day = todayArray[1];
            if(parseInt(month) < 10) {
                month = '0' + month;
            }
            if (parseInt(day) < 10) {
                day = '0' + day;
            }
            return year+'-'+month+'-'+day;
        },
        //api call to get user projects
        getProjects() {
            for(let i=0;i<5;i++) {
                this.projects.push({
                    id: i,
                    due: new Date().toISOString(),
                    points: [i,i+12,i+3],
                    title: "Project "+(i+1),
                    desc: 'Project description for project '+(i+1),
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
                        },
                        {
                            id: i+2,
                            name: 'Most recent',
                            date: new Date().toISOString(),
                            desc: 'The final update.'
                        }
                    ],
                    completed: 'incomplete'
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
            this.editProject = null;
            this.editProjectTitle = '';
            this.editProjectDesc = '';
            this.editProjectDueDate = '';
            this.editProjectUpdateTitle = '';
            this.editProjectUpdateDesc = '';
            this.delProject = null;
        },
        clearSearch() {
            this.projectSearch = '';
        },
        newProject() {
            this.projectView = 'new';
        },
        // handle AI feedback
        aiFeedback(desc) {
            if(desc) {
                this.aiFeedbackText = 'This description is adequate!';
                this.newRPoints = Math.floor(Math.random() * 51);
                this.newGPoints = Math.floor(Math.random() * 51);
                this.newBPoints = Math.floor(Math.random() * 51);
                let d = new Date();
                d.setDate(d.getDate() + 1);
                this.newDueDate = d.toISOString();
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
                finalDate = finalDate.toISOString();
            }
            this.projects.push({
                id: this.projects.length,
                due: finalDate,
                points: [this.newRPoints,this.newGPoints,this.newBPoints],
                title: this.newTitle,
                desc: this.newDesc,
                updates: [],
                completed: 'incomplete'
            });
            this.$emit('project-success',this.newTitle + ' successfully created.');
            this.resetData();
        },
        // api call to handle done project
        done(project) {
            this.$emit('project-completed',project.title+' has been marked as complete!',project.points[0],project.points[1],project.points[2]);
            project.completed = new Date().toISOString();
            this.projects = this.projects.filter((item) => item !== project);
        },
        edit(project) {
            this.editProject = project;
            this.editProjectTitle = project.title;
            this.editProjectDesc = project.desc;
            this.newRPoints = project.points[0];
            this.newGPoints = project.points[1];
            this.newBPoints = project.points[2];
            this.editProjectDueDate = this.convertDate(project.due);
            //have AI decide what the description is here
            this.aiFeedbackText = 'This description is adequate!';
            this.projectView = 'edit';
        },
        // api call to handle edit project
        confirmEdit(project) {
            // handle if project name already exists
            for(let i=0;i<this.projects.length;i++) {
                if(this.editProjectTitle === this.projects[i].title && this.editProjectTitle !== project.title) {
                    this.$emit('project-error','Error: A project with name \"'+this.editProjectTitle+'\" already exists.');
                    return;
                }
            }
            let finalDate = new Date(this.editProjectDueDate);
            finalDate.setDate(finalDate.getDate() + 1);
            finalDate = finalDate.toISOString();
            // if no updates have actually been made to project fields
            if(this.editProjectTitle === project.title && this.editProjectDesc === project.desc && finalDate === project.due) {
                this.$emit('project-warning','Warning: No project details have changed.');
                return;
            }
            project.title = this.editProjectTitle;
            project.desc = this.editProjectDesc;
            project.points = [this.newRPoints,this.newGPoints,this.newBPoints];
            project.due = finalDate;
            project.updates.push({
                id: project.updates.length,
                name: this.editProjectUpdateTitle,
                date: new Date().toISOString(),
                desc: this.editProjectUpdateDesc
            });
            this.$emit('project-success',this.editProjectTitle + ' has been successfully updated.');
            this.resetData();
        },
        showDelDialog(project) {
            this.showDel = true;
            this.delProject = project;
        },
        // api call to handle delete project
        del (project) {
            this.showDel = false;
            this.$emit('project-completed',project.title+' has been successfully deleted',0,0,0);    
            this.projects = this.projects.filter((item) => item !== project);
        }
    },
    components: {
      
    },
  };