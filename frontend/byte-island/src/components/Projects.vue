<template>
    
        <div v-if="projectView === 'all'">
            <h1 class="header-h1 ml-2 mb-1">My Projects</h1>
            <v-btn variant="outlined" color="success" class="ml-2 custom-btn mb-5 mt-2" @click="newProject()">Add New!</v-btn>
            <v-text-field
                v-model="projectSearch"
                density="compact"
                label="Search projects by title"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                bg-color="white"
                hide-details
                clearable
                @click:clear = "clearSearch()"
                single-line
                class="mx-3 mb-3 italic-search"
            ></v-text-field>
             
            <v-list-item v-for="project in filteredProjects" :key="project.Id">
                <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                <pre class="text-muted ml-1">&emsp;Due: {{convertDate(project.Due)}}</pre>
                <pre class="text-muted ml-1">&emsp;Points: <span style="color: rgb(215,0,0);">{{project.Points[0]}}</span>, <span style="color: rgb(151,255,45);">{{project.Points[1]}}</span>, <span style="color: rgb(101,135,231);">{{project.Points[2]}}</span></pre>
                <h1 class="ml-3">{{project.Title}}</h1>
                <p class="ml-3" v-for="update in project.Updates" :key="update.Id">
                    <br>
                    <h3 class="text-muted">{{update.Name}} [{{update.Date}}]:</h3>
                    <span class="text-muted">{{update.Desc}}</span>
                    <br>
                </p>
                <p v-if="project.Updates.length === 0" class="ml-3">
                    <br>
                    <h3 class="text-muted"><i>This project has no updates.</i></h3>
                    <br>
                </p>
                <div v-if="!project.Expired">
                    <v-row class="my-0 mb-3" justify="space-around" v-if="project.Completed === 'incomplete'">
                        <v-col cols="12">
                            <v-btn color="success" class="ml-3" variant="outlined" size="small" @click="done(project)">Done!</v-btn>
                            <v-btn color="primary" class="ml-3" variant="outlined" size="small" @click="edit(project)">Edit</v-btn>
                            <v-btn color="red" class="ml-3" variant="outlined" size="small" @click="showDelDialog(project)">Delete</v-btn>
                        </v-col>
                    </v-row>
                    <v-row class="my-0 mb-3" justify="space-around" v-else>
                        <pre class="header-h1 text-center"><i>COMPLETED!</i></pre>    
                    </v-row>
                </div>    
                <div v-else>
                    <v-row class="my-0 mb-3" justify="space-around">
                        <pre class="expired-proj text-center"><i>EXPIRED!</i></pre>    
                    </v-row>
                </div>
                

            </v-list-item>
            <v-list-item v-if="!loaded">
                <h1 class="text-center mt-5"><i>Loading...</i></h1>
            </v-list-item>
            <v-list-item v-if="filteredProjects.length === 0 && loaded">
                <h1 class="text-center mt-5"><i>No projects found...</i></h1>
            </v-list-item>
        </div>
        <div v-else-if="projectView === 'new'">
            <h1 class="header-h1 ml-2 mb-5" :runPointValues="getPointsValues(false)">New Project</h1>
            <h3 class="ml-5">Project title:</h3>
            <v-text-field maxlength="30" counter persistent-counter v-model="newTitle" :rules="[rules.required]" variant="outlined" class="mx-5 mt-3" label="Project Title">

            </v-text-field>
            <h3 class="ml-5">Describe your new project:</h3>
            <v-textarea maxlength="500" counter persistent-counter v-model="newDesc" @input="aiFeedback(newDesc,false)" :rules="[rules.required]" no-resize variant="outlined" class="mx-5 mt-3" label="Project Description">

            </v-textarea>
            <pre class="ml-5">{{aiFeedbackText}}</pre>
            
            <h3 class="ml-5 mt-2">Select Project Difficulty:</h3>
            <v-btn-toggle rounded class="mx-2 toggle-group" id="difficultySelectorMenu" v-model="difficultyCategory" mandatory>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#63c27b">Very Easy</v-btn>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#A3FFC9">Easy</v-btn>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#DDDDDD">Moderate</v-btn>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#FF9095">Difficult</v-btn>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#de333b">Grueling</v-btn>
            </v-btn-toggle>

            <h3 class="ml-5 mt-2">Select Project Size:</h3>
            <v-btn-toggle rounded class="mx-2 toggle-group" id="lengthSelectorMenu" v-model="lengthCategory" mandatory>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#63c27b">Tiny</v-btn>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#A3FFC9">Small</v-btn>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#DDDDDD">Average</v-btn>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#FF9095">Large</v-btn>
                <v-btn @click="getPointsValues(false)" class="ma-1 toggle-btn" size="small" color="#de333b">Gigantic</v-btn>
            </v-btn-toggle>

            <h3 class="ml-5 mt-2">Select Project Category:</h3>
            <v-btn-toggle rounded class="mx-2 toggle-group" id="pointCategoryMenu" v-model="pointCategory" mandatory>
                <v-btn @click="updateCategory();getPointsValues(false)" class="ma-1 toggle-btn-mk2" size="medium" color="#FF9095">Networking</v-btn>
                <v-btn @click="updateCategory();getPointsValues(false)" class="ma-1 toggle-btn-mk2" size="medium" color="#A3FFC9">Self-Growth</v-btn>
                <v-btn @click="updateCategory();getPointsValues(false)" class="ma-1 toggle-btn-mk2" size="medium" color="#7DAEFF">Career</v-btn>
            </v-btn-toggle>

            <pre class="ml-5 text-muted mt-1">Automatic Due Date:</pre>
            <pre class="ml-5">{{convertDate(newDueDate)}}</pre>
            <pre class="ml-5 text-muted mt-2">Override Due Date:</pre>
            <v-text-field v-on:input="getPointsValuesNoDate(false)" :min="todayDate" type="date" v-model="overrideDueDate" variant="outlined" class="mx-5 mt-1" label="Due Date">

            </v-text-field>

            <pre class="ml-5 text-muted mt-2 mb-2">Points you'll gain: <span style="color: rgb(215,0,0);">{{newRPoints}}</span>, <span style="color: rgb(151,255,45);">{{newGPoints}}</span>, <span style="color: rgb(101,135,231);">{{newBPoints}}</span></pre>

            <v-row class="mt-n3 mb-3 mx-0 text-center" justify="space-around">
                    <v-col cols="12">
                        <v-btn color="success" :disabled="!(newTitle && newDesc)" class="custom-btn" variant="outlined" @click="createProject()"><u>All set!</u></v-btn>
                    </v-col>
                </v-row>
        </div>
        <div v-else-if="projectView === 'edit'">
            <h1 class="header-h1 ml-2 mb-5" :runPointValues="getPointsValues(true)">Edit Project: <span style="color: white;">{{editProject.Title}}</span></h1>
            <h3 class="ml-5">Project title:</h3>
            <v-text-field maxlength="30" counter persistent-counter v-model="editProjectTitle" :rules="[rules.required]" variant="outlined" class="mx-5 mt-3" label="Project Title">

            </v-text-field>
            <h3 class="ml-5">Describe the project:</h3>
            <v-textarea maxlength="500" counter persistent-counter v-model="editProjectDesc" @input="aiFeedback(editProjectDesc,true)" :rules="[rules.required]" no-resize variant="outlined" class="mx-5 mt-3" label="Project Description">

            </v-textarea>
            <pre class="ml-5">{{aiFeedbackText}}</pre>
            <!-- <pre class="ml-5 text-muted mt-2">Points you'll gain: <span style="color: rgb(215,0,0);">{{newRPoints}}</span>, <span style="color: rgb(151,255,45);">{{newGPoints}}</span>, <span style="color: rgb(101,135,231);">{{newBPoints}}</span></pre>
            <h3 class="ml-5 mt-3">Due Date:</h3>
            <v-text-field :min="todayDate" type="date" v-model="editProjectDueDate" variant="outlined" class="mx-5 mt-3" label="Due Date">

            </v-text-field> -->

            <!-- Start of copied -->

            <h3 class="ml-5 mt-2">Select Project Difficulty:</h3>
            <v-btn-toggle rounded class="mx-2 toggle-group" id="difficultySelectorMenu" v-model="difficultyCategory" mandatory>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#63c27b">Very Easy</v-btn>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#A3FFC9">Easy</v-btn>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#DDDDDD">Moderate</v-btn>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#FF9095">Difficult</v-btn>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#de333b">Grueling</v-btn>
            </v-btn-toggle>

            <h3 class="ml-5 mt-2">Select Project Size:</h3>
            <v-btn-toggle rounded class="mx-2 toggle-group" id="lengthSelectorMenu" v-model="lengthCategory" mandatory>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#63c27b">Tiny</v-btn>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#A3FFC9">Small</v-btn>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#DDDDDD">Average</v-btn>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#FF9095">Large</v-btn>
                <v-btn @click="getPointsValues(true)" class="ma-1 toggle-btn" size="small" color="#de333b">Gigantic</v-btn>
            </v-btn-toggle>

            <h3 class="ml-5 mt-2">Select Project Category:</h3>
            <v-btn-toggle rounded class="mx-2 toggle-group" id="pointCategoryMenu" v-model="pointCategory" mandatory>
                <v-btn @click="updateCategory();getPointsValues(true)" class="ma-1 toggle-btn-mk2" size="medium" color="#FF9095">Networking</v-btn>
                <v-btn @click="updateCategory();getPointsValues(true)" class="ma-1 toggle-btn-mk2" size="medium" color="#A3FFC9">Self-Growth</v-btn>
                <v-btn @click="updateCategory();getPointsValues(true)" class="ma-1 toggle-btn-mk2" size="medium" color="#7DAEFF">Career</v-btn>
            </v-btn-toggle>

            <pre class="ml-5 text-muted mt-1">Automatic Due Date:</pre>
            <pre class="ml-5">{{convertDate(newDueDate)}}</pre>
            <pre class="ml-5 text-muted mt-2">Override Due Date:</pre>
            <v-text-field v-on:input="getPointsValuesNoDate(true)" :min="todayDate" type="date" v-model="overrideDueDate" variant="outlined" class="mx-5 mt-1" label="Due Date">

            </v-text-field>

            <pre class="ml-5 text-muted mt-2 mb-2">Points you'll gain: <span style="color: rgb(215,0,0);">{{newRPoints}}</span>, <span style="color: rgb(151,255,45);">{{newGPoints}}</span>, <span style="color: rgb(101,135,231);">{{newBPoints}}</span></pre>

            <!-- End of copied from above -->

            <h3 class="ml-5 mt-3">Provide an update title for this change:</h3>
            <v-text-field maxlength="100" counter persistent-counter v-model="editProjectUpdateTitle" :rules="[rules.required]" variant="outlined" class="mx-5 mt-3" label="Update Title">

            </v-text-field>
            <h3 class="ml-5 mt-3">Provide an update description for this change:</h3>
            <v-textarea maxlength="500" counter persistent-counter v-model="editProjectUpdateDesc" :rules="[rules.required]" no-resize variant="outlined" class="mx-5 mt-3" label="Update Description">

            </v-textarea>
            <v-row class="mt-n3 mb-3 mx-0 text-center" justify="space-around">
                    <v-col cols="12">
                        <v-btn color="success" :disabled="!(editProjectTitle && editProjectDesc && editProjectUpdateTitle && editProjectUpdateDesc)" class="custom-btn" variant="outlined" @click="confirmEdit(editProject)"><u>Confirm changes</u></v-btn>
                    </v-col>
                </v-row>
        </div>   
    
    <v-dialog v-model="showDel" max-width="500" persistent>
        <template v-slot:default="{}">
            <v-card :title="'Delete Project: ' + delProject.Title">
            <v-card-text>
                Are you sure you want to delete this project?
            </v-card-text>

            <v-card-actions class="mb-3 mx-3">
                <v-spacer></v-spacer>
                <v-btn
                text="No"
                class="mr-3"
                variant="outlined"
                color="red"
                @click="showDel = false"
                ></v-btn>
                <v-btn
                text="Yes"
                variant="outlined"
                color="primary"
                @click="del(delProject)"
                ></v-btn>
            </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>
<style>
    pre {
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    .header-h1 {
        font-size: 2rem;
        color: rgb(152,255,134);
    }
    .expired-proj {
        font-size: 2rem;
        color: red;
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

    .toggle-group {
    border-radius: 10px !important;
    height: 100%;
    border: 3px solid;
    width: calc(98% - 4px);
    }
    .toggle-btn {
        width: calc(20% - 8px);
        border-radius: 5px !important;
        height: 35px !important;
    }
    .toggle-btn-mk2 {
        width: calc(33% - 8px);
        border-radius: 5px !important;
        height: 35px !important;
    }
    .trns-btn {
        min-width: 0;
        min-height: 0;
        padding: 0;
        margin: 0;
        background-color: transparent;
        border: solid 3px;
        border-radius: 8px;
    }
</style>
<script src="./js/Projects.js">
</script>