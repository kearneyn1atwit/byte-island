<template>
    <div>
        <h1 class="header-h1 ml-2 mt-0 mb-1">Friends</h1>
        <v-text-field
                v-model="friendSearch"
                v-if="!friendVisited"
                density="compact"
                label="Search friends by username"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                bg-color="white"
                hide-details
                clearable
                single-line
                class="mx-3 mb-3 italic-search"
            ></v-text-field>
        <div v-if="!friendVisited">
            <v-list-item v-for="friend in filteredFriends" :key="friend.id">
                <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
                <v-row>
                    <v-col cols="auto">
                        <v-avatar class="mt-3 mr-n2" :image="friend.pfp" style="border: 1.5px solid white;"></v-avatar>
                    </v-col>
                    <v-col>
                        <pre class="mb-n1 mt-5">{{friend.username}}</pre>            
                    </v-col>    
                </v-row>
                <v-row class="my-0 mb-n1" justify="space-around">
                    <v-col cols="12">
                        <v-btn class="mr-3" color="success" variant="outlined" size="small" @click="visit(friend)">Visit</v-btn>
                        <v-btn color="red" variant="outlined" size="small" @click="unfriend(friend)">Un-friend</v-btn>
                    </v-col>
                </v-row>
            </v-list-item>
        </div>
        
    <v-list-item v-if="friends.length === 0 && !friendVisited">
        <h1 class="ml-0"><i>You have no friends</i></h1>
    </v-list-item>
    <v-list-item v-else-if="filteredFriends.length === 0 && !friendVisited">
        <h1 class="ml-0"><i>No friends found</i></h1>
    </v-list-item>
    <v-list-item v-if="friendVisited">
        <hr class="mb-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
        <v-row align="center" class="mt-3">
            <v-col cols="auto">
                <v-avatar size="70" :image="visitedFriend.pfp" style="border: 1.5px solid white;"></v-avatar>
            </v-col>
            <v-col>
                <pre><h1 class="friend-text">{{visitedFriend.username}}</h1></pre>
                <pre>Friends since: <span class="text-muted">{{visitedFriend.friendsSince}}</span></pre>             
            </v-col>    
        </v-row>
        <hr class="my-5" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
        <h2 style="color: rgb(152,255,134);" class="mb-2 text-center">{{visitedFriend.username}}'s Projects</h2>
        <v-list-item v-for="project in friendsProjects" :key="project.id">
                <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                <pre v-if="project.completed === 'incomplete'" class="text-muted ml-1">&emsp;Due: {{project.due}}</pre>
                <pre v-else class="text-muted ml-1">&emsp;Completed: {{project.completed}}</pre>
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
                <pre v-if="project.completed !== 'incomplete'" class="header-h1 text-center mt-3"><i>COMPLETED!</i></pre>    
            </v-list-item>
    </v-list-item>
    </div>
</template>
<style scoped>
.header-h1 {
    font-size: 2rem;
    color: rgb(152,255,134);
}
.friend-text {
    font-size: 175%;
    font-weight: italic !important;
}
</style>
<script src="./js/Friends.js">
</script>