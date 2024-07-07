import { mapGetters } from "vuex";
import { mapMutations } from "vuex";

export default {
    data() {
      return {
        username: '',
        token: null,
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
        delProject: null,
        loaded: false
      };
    },
    async created() {
      
    },
    computed: {
      ...mapGetters(['getToken','getUsername','getPoints']),
      filteredProjects() {
        if(!this.projects) {
            return [];
        }
        if(!this.projectSearch) {
            return this.projects;
        }
        return this.projects.filter(project => {
            return project.Title.toLowerCase().includes(this.projectSearch.toLowerCase()) 
        }).sort((a,b) => (a.Completed === 'incomplete' ? 0 : 1) - (b.Completed === 'incomplete' ? 0 : 1) );
      }
    },
    mounted() {
        this.getUserDetails();
        this.todayDate = this.convertDate(new Date().toISOString());
        this.getProjects();
    },
    methods: {
        ...mapMutations(['setPoints','resetStore']),
        getUserDetails() {
            this.token = this.getToken;
            this.username = this.getUsername;
        },
        // convert date to text field model friendly
        convertDate(date) {
            if(date === 'N/A') {
                return date;
            }
            let todayArray = date.split("-");
            let year = todayArray[0];
            let month = todayArray[1];
            let day = todayArray[2].split('T')[0];
            return year+'-'+month+'-'+day;
        },
        //api call to get user projects
        getProjects() {
            fetch("http://localhost:5000/projects/"+this.username, {
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
              this.projects = [];
              if (!data.message) {
                this.projects = data;
              }  
              this.loaded = true;
            })
            .catch(error => {
                console.error('Error with Projects API:', error);
                this.loaded = true;
            });
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
            //handle if project name already exists
            for(let i=0;i<this.projects.length;i++) {
                if(this.newTitle === this.projects[i].Title) {
                    this.$emit('project-error','Error: A project with name \"'+this.newTitle+'\" already exists.');
                    return;
                }
            }
            let finalDate = this.newDueDate;
            if(this.overrideDueDate) {
                finalDate = new Date(this.overrideDueDate);
                finalDate = finalDate.toISOString();
            }
            fetch("http://localhost:5000/projects/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    due: finalDate,
                    points: [this.newRPoints,this.newGPoints,this.newBPoints],
                    title: this.newTitle,
                    desc: this.newDesc
                }) 
            })
            .then(response => {
                if (!response.ok) {
                    if(response.status === 401) {
                        //log out
                        this.$router.push('/');
                        this.resetStore();
                      }
                }
                this.projects = [];
                this.loaded = false;
                this.$emit('project-success',this.newTitle + ' successfully created.');
                this.resetData();
                this.getProjects();
            })
            .catch(error => {
                this.$emit('project-error',error);
                console.error('Error with Projects API:', error);
            });
        },
        // api call to handle done project
        done(project) {
            fetch("http://localhost:5000/projects/", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    projectId: project.Id,
                    markAsDone: true,
                    due: project.Due,
                    points: project.Points,
                    title: project.Title,
                    desc: project.Desc,
                    updateTitle: '',
                    updateDesc: ''
                }) 
            })
            .then(response => {
                if (!response.ok) {
                    if(response.status === 401) {
                        //log out
                        this.$router.push('/');
                        this.resetStore();
                      }
                }
                this.setPoints([this.getPoints[0]+project.Points[0],this.getPoints[1]+project.Points[1],this.getPoints[2]+project.Points[2]]);
                this.getProjects();
                this.$emit('project-completed',project.Title+' has been marked as complete!');
            })
            .catch(error => {
                this.$emit('project-error',error);
                console.error('Error with Projects API:', error);
            });
        },
        edit(project) {
            this.editProject = project;
            this.editProjectTitle = project.Title;
            this.editProjectDesc = project.Desc;
            this.newRPoints = project.Points[0];
            this.newGPoints = project.Points[1];
            this.newBPoints = project.Points[2];
            this.editProjectDueDate = this.convertDate(project.Due);
            //have AI decide what the description is here
            this.aiFeedbackText = 'This description is adequate!';
            this.projectView = 'edit';
        },
        // api call to handle edit project
        confirmEdit(project) {
            // handle if project name already exists
            for(let i=0;i<this.projects.length;i++) {
                if(this.editProjectTitle === this.projects[i].Title && this.editProjectTitle !== project.Title) {
                    this.$emit('project-error','Error: A project with name \"'+this.editProjectTitle+'\" already exists.');
                    return;
                }
            }
            let finalDate = new Date(this.editProjectDueDate);
            finalDate = finalDate.toISOString();
            // if no updates have actually been made to project fields
            if(this.editProjectTitle === project.Title && this.editProjectDesc === project.Desc && this.convertDate(finalDate) === this.convertDate(project.Due)) {
                this.$emit('project-warning','Warning: No project details have changed.');
                return;
            }
            fetch("http://localhost:5000/projects/", {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    projectId: project.Id,
                    markAsDone: false,
                    due: finalDate,
                    points: [this.newRPoints,this.newGPoints,this.newBPoints],
                    title: this.editProjectTitle,
                    desc: this.editProjectDesc,
                    updateTitle: this.editProjectUpdateTitle,
                    updateDesc: this.editProjectUpdateDesc
                }) 
            })
            .then(response => {
                if (!response.ok) {
                    if(response.status === 401) {
                        //log out
                        this.$router.push('/');
                        this.resetStore();
                      }
                }
                this.projects = [];
                this.loaded = false;
                this.getProjects();
                this.$emit('project-success',this.editProjectTitle + ' has been successfully updated.');
                this.resetData();
            })
            .catch(error => {
                this.$emit('project-error',error);
                console.error('Error with Projects API:', error);
            });
        },
        showDelDialog(project) {
            this.showDel = true;
            this.delProject = project;
        },
        // api call to handle delete project
        del (project) {
            fetch("http://localhost:5000/projects/", {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': this.token
                },
                body: JSON.stringify({
                    username: this.username,
                    projectId: project.Id
                }) 
            })
            .then(response => {
                if (!response.ok) {
                    if(response.status === 401) {
                        //log out
                        this.$router.push('/');
                        this.resetStore();
                      }
                }
                this.showDel = false;
                this.getProjects();
                this.$emit('project-completed',project.Title+' has been successfully deleted');
            })
            .catch(error => {
                this.$emit('project-error',error);
                console.error('Error with Projects API:', error);
            });
        }
    },
    emits: ['project-error','project-success','project-completed','project-warning'],
    components: {
      
    },
  };