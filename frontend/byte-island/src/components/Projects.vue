<template>
    <div>
        <div v-if="projectView === 'all'">
            <h1 class="header-h1 ml-2 my-5">My Projects</h1>
            <v-btn variant="outlined" color="success" class="ml-2 custom-btn mb-5" @click="newProject()"><u>Add New!</u></v-btn>
            <v-text-field
                v-model="projectSearch"
                density="compact"
                label="Search projects by title"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                hide-details
                single-line
                class="mx-3 mb-3 italic-search"
            ></v-text-field>
            <v-list-item v-for="project in filteredProjects" :key="project.id">
                <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                <pre class="text-muted ml-1">&emsp;Due: {{project.due}}</pre>
                <pre class="text-muted ml-1">&emsp;Points: <span style="color: rgb(215,0,0);">{{project.points[0]}}</span>, <span style="color: rgb(151,255,45);">{{project.points[1]}}</span>, <span style="color: rgb(101,135,231);">{{project.points[2]}}</span></pre>
                <h1 class="ml-3">{{project.title}}</h1>
                <p class="ml-3" v-for="update in project.updates" :key="update.id">
                    <br>
                    <h3 class="text-muted">{{update.name}} [{{update.date}}]:</h3>
                    <span class="text-muted">{{update.desc}}</span>
                    <br>
                </p>
                <p v-if="project.updates.length === 0" class="ml-3">
                    <br>
                    <h3 class="text-muted"><i>This project has no updates.</i></h3>
                    <br>
                </p>    
                <v-row class="my-0 mb-3" justify="space-around">
                    <v-col cols="12">
                        <v-btn color="success" class="ml-3" variant="outlined" size="small" @click="done(project)">Done!</v-btn>
                        <v-btn color="primary" class="ml-3" variant="outlined" size="small" @click="edit(project)">Edit</v-btn>
                        <v-btn color="red" class="ml-3" variant="outlined" size="small" @click="del(project)">Delete</v-btn>
                    </v-col>
                </v-row>

            </v-list-item>
            <v-list-item v-if="filteredProjects.length === 0">
                <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                <h1 class="ml-3"><i>No projects found...</i></h1>
            </v-list-item>
        </div>
        <div v-else-if="projectView === 'new'">
            <h1 class="header-h1 ml-2 my-5">New Project</h1>
            <h3 class="ml-5">Project title:</h3>
            <v-text-field v-model="newTitle" :rules="[rules.required]" variant="outlined" class="mx-5 mt-3" label="Project Title">

            </v-text-field>
            <h3 class="ml-5">Describe your new project:</h3>
            <v-textarea v-model="newDesc" @input="aiFeedback()" :rules="[rules.required]" no-resize variant="outlined" class="mx-5 mt-3" label="Project Description">

            </v-textarea>
            <pre class="ml-5"><b>AI Feedback</b>: {{aiFeedbackText}}</pre>
            <pre class="ml-5 text-muted mt-2">Points you'll gain: <span style="color: rgb(215,0,0);">{{newRPoints}}</span>, <span style="color: rgb(151,255,45);">{{newGPoints}}</span>, <span style="color: rgb(101,135,231);">{{newBPoints}}</span></pre>
            <pre class="ml-5 text-muted mt-1">Automatic Due Date:</pre>
            <pre class="ml-5">{{newDueDate}}</pre>
            <pre class="ml-5 text-muted mt-2">Override Due Date:</pre>
            <v-text-field :min="todayDate" type="date" v-model="overrideDueDate" variant="outlined" class="mx-5 mt-1" label="Due Date">

            </v-text-field>
            <v-row class="mt-n3 mb-3 mx-0 text-center" justify="space-around">
                    <v-col cols="12">
                        <v-btn color="success" :disabled="!(newTitle && newDesc)" class="custom-btn" variant="outlined" @click="createProject()"><u>All set!</u></v-btn>
                    </v-col>
                </v-row>
        </div>   
    </div>
</template>
<style>
    .header-h1 {
        font-size: 2rem;
        color: rgb(152,255,134);
    }
    .text-muted {
        color: grey;
    }
    .custom-btn:hover {
        background-color: #98FF86;
        color: black !important;
        border-color: #98FF86;
    }
    .cancel-btn:hover {
        background-color: rgb(33,150,243);
        color: black !important;
        border-color: rgb(33,150,243);
    }
    .italic-search .v-label {
        font-style: italic;
    }
</style>
<script src="./js/Projects.js">
</script>