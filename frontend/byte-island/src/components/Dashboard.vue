<template>
<v-app v-if="loaded">
    <v-fade-transition>
      <v-alert closable @click:close="showSuccessAlert = false" v-if="showSuccessAlert" position="absolute" color="success" icon="$success" elevation="10" :text="successAlertText" style="z-index: 9000; right: 20px; top: 20px;"></v-alert>
      <v-alert closable @click:close="showErrorAlert = false" v-if="showErrorAlert" position="absolute" color="red" icon="$error" elevation="10" :text="errorAlertText" style="z-index: 9000; right: 20px; top: 20px;"></v-alert>
    </v-fade-transition>  
    <v-layout>
      <VResizeDrawer
        v-model="drawer"
        location="right"
        handle-color="grey"
        handle-border-width="5"
        handle-position="border"
        :save-width="false"
        width="500"
        min-width="200"
        :width-snap-back="false"
        :temporary="true"
        persistent
      >
        <div style="position: sticky; top:0; left: 5px; width:calc(100% - 5px); z-index: 1; background-color: rgb(33,33,33);">
          <v-list-item v-if="widget === 'dashboard'">
            <div v-if="notifCount > 0">
              <v-badge color="rgb(89,153,80)" :content="notifCount" class="ml-auto ma-5 mt-4 badge-lg">
                  <v-icon icon="mdi-menu" class="menu-icon" @click.stop="drawer = !drawer"></v-icon>
              </v-badge>
            </div>
            <div v-else>
              <v-icon icon="mdi-menu" class="menu-icon ml-auto ma-5 mt-4" @click.stop="drawer = !drawer"></v-icon>
            </div>
        </v-list-item>

        <v-list-item v-else>
          <div v-if="widget !== 'notifications'">
            <div v-if="notifCount > 0">
              <v-badge color="rgb(89,153,80)" :content="notifCount" class="ml-auto ma-5 mt-4 badge-lg">
                <v-icon icon="mdi-arrow-left" class="menu-icon" @click.stop="toWidget('dashboard')"></v-icon>
              </v-badge>
            </div>  
            <div v-else>
              <v-icon icon="mdi-arrow-left" class="menu-icon ml-auto ma-5 mt-4" @click.stop="toWidget('dashboard')"></v-icon>
            </div>
          </div>
          <div v-else>
            <v-icon icon="mdi-arrow-left" class="menu-icon ml-auto ma-5 mt-4 badge-lg" @click.stop="toWidget('dashboard')"></v-icon>
          </div>
        </v-list-item>
          <v-divider></v-divider>
        </div>

        <v-list density="compact" nav class="custom-nav">
          <div v-if="widget === 'dashboard'">
            <v-list-item title="Notifications" value="notifications" @click="toWidget('notifications')"></v-list-item>   
            <v-badge v-if="notifCount > 0" color="rgb(89,153,80)" class="badge-lg" :content="notifCount" style="position: absolute; top: 30px; left: 175px;"></v-badge> 
            <v-list-item title="My Projects" value="projects" style="color: rgb(152,255,134);" @click="toWidget('projects')"></v-list-item>
            <v-list-item title="Search" value="search" @click="wip()"></v-list-item>
            <v-list-item title="Friends" value="friends" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
            <v-list-item title="Networks" value="networks" @click="wip()"></v-list-item>
            <v-list-item title="My Posts" value="posts" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
            <v-list-item title="Island Shop" value="shop" @click="wip()"></v-list-item>
            <v-list-item title="Settings" value="settings" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
            <v-list-item title="Sign Out" value="signout" @click="showSignOut = true"></v-list-item>
          </div>  
          <Notifications ref="notificationsRef" :notifCount="notifCount" @remove-notif-event="notifCount--" v-if="widget === 'notifications'">

          </Notifications>
          <Projects ref="projectsRef" @project-created="showSuccessAlertFunc" @project-error="showErrorAlertFunc" v-if="widget === 'projects'">
            
          </Projects>    
        </v-list>
      </VResizeDrawer>
        <v-main>
    <div class="h-100">
        <v-row>
        <h1 class="mt-5 mb-0 ml-7">Points</h1>
        <div v-if="notifCount > 0" class="ml-auto ma-5 mt-8 mr-10 badge-lg">
          <v-badge color="rgb(89,153,80)" :content="notifCount" >
            <v-icon icon="mdi-menu" class="menu-icon" @click.stop="drawer = !drawer"></v-icon>
          </v-badge>
        </div>
        <div class="ml-auto ma-5 mt-8 mr-10 badge-lg" v-else>
          <v-icon icon="mdi-menu" class="menu-icon" @click.stop="drawer = !drawer"></v-icon>
        </div>
            <ul class="ml-7 w-100 mt-n5" style="list-style-type: none;">
                <li class="font-weight-bold" style="color: rgb(215,0,0);"><v-icon icon="mdi-emoticon" class="mr-2"></v-icon>{{rPoints}}</li>
                <li class="font-weight-bold" style="color: rgb(151,255,45);"><v-icon icon="mdi-pine-tree" class="mr-2"></v-icon>{{gPoints}}</li>
                <li class="font-weight-bold" style="color: rgb(101,135,231);"><v-icon icon="mdi-cloud" class="mr-2"></v-icon>{{bPoints}}</li>
            </ul>
            
        </v-row>
        <v-row class="mt-3 mx-1">
            <v-col cols="12" class="text-center">
                <img style="max-width: 50%; min-width: 250px;" src="/island.png" alt="island">
            </v-col>
        </v-row>
    </div>    
  </v-main>
    </v-layout>
  </v-app>


  <v-dialog v-model="showSignOut" max-width="500">
  <template v-slot:default="{}">
    <v-card title="Sign Out">
      <v-card-text>
        Are you sure you want to sign out?
      </v-card-text>

      <v-card-actions class="mb-3 mx-3">
        <v-spacer></v-spacer>

        <v-btn
          text="No"
          class="mr-3"
          variant="outlined"
          color="red"
          @click="showSignOut = false"
        ></v-btn>
        <v-btn
          text="Yes"
          variant="outlined"
          color="primary"
          @click="signOut()"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </template>
</v-dialog>
    
    
    
</template>
<style scoped>
li {
    font-size: 1.25rem;
}
.menu-icon {
    font-size: 300%;
    padding: 15px 25px;
    border-radius: 10px;
    border: 2px solid white;
}
.custom-nav :deep(.v-list-item-title) {
    font-size: 1.5rem;
    line-height: 2.5rem;
    text-decoration: underline;
}
</style>
<style>
.badge-lg .v-badge__badge {
  font-size: 1.25rem;
  border-radius: 20px;
  height: 1.5rem;
}
.fade-enter-active {
  transition: opacity .5s
}
.fade-enter,
.fade-leave-active {
  opacity: 0
}
</style>
<script src="./js/Dashboard.js">
</script>