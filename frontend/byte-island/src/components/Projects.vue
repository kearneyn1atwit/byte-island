<template>
    <div>
    <h1 class="header-h1 ml-2 my-5">My Projects</h1>
    <v-btn variant="outlined" color="success" class="ml-2 custom-btn mb-5" @click="wip()"><u>Add New!</u></v-btn>
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
            <h3><span class="text-muted">{{update.name}} [{{update.date}}]:</span></h3>
            <span class="text-muted">{{update.desc}}</span>
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
    .italic-search .v-label {
        font-style: italic;
    }
</style>
<script src="./js/Projects.js">
</script>