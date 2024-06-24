<template>
<v-app v-if="loaded">
    <v-fade-transition>
      <v-alert closable @click:close="hideAlerts()" v-if="showSuccessAlert" position="absolute" color="success" icon="$success" elevation="10" :text="successAlertText" style="z-index: 9000; right: 20px; top: 20px;"></v-alert>
      <v-alert closable @click:close="hideAlerts()" v-if="showErrorAlert" position="absolute" color="red" icon="$error" elevation="10" :text="errorAlertText" style="z-index: 9000; right: 20px; top: 20px;"></v-alert>
      <v-alert closable @click:close="hideAlerts()" v-if="showWarningAlert" position="absolute" color="warning" icon="$warning" elevation="10" :text="warningAlertText" style="z-index: 9000; right: 20px; top: 20px;"></v-alert>  
    </v-fade-transition>  
    <v-layout>
      <VResizeDrawer
        v-model="drawer"
        location="right"
        handle-color="grey"
        handle-border-width="5"
        handle-position="border"
        :save-width="true"
        width="500"
        min-width="350"
        :width-snap-back="false"
        :temporary="true"
        persistent
        :scrim="false"
      >
        <div style="position: sticky; top:0; left: 5px; width:calc(100% - 5px); z-index: 2; background-color: rgb(33,33,33);">
          <v-list-item v-if="widget === 'dashboard'">
            <div v-if="notificationCount + requestCount > 0">
              <v-badge color="rgb(89,153,80)" :content="notificationCount + requestCount" class="ml-auto ma-5 mt-4 badge-lg">
                  <v-icon icon="mdi-menu" class="menu-icon" @click.stop="drawer = !drawer"></v-icon>
              </v-badge>
            </div>
            <div v-else>
              <v-icon icon="mdi-menu" class="menu-icon ml-auto ma-5 mt-4" @click.stop="drawer = !drawer"></v-icon>
            </div>
            <div>
              <h1 style="font-size: 3rem; position: absolute; width: 100%; top: 10px; z-index: -1" class="text-center"><v-avatar class="mr-5" size="55" style="border: 1.5px solid white;" :image="pfp"></v-avatar>{{username}}</h1>
            </div>
        </v-list-item>

        <v-list-item v-else>
          <div v-if="notificationCount + requestCount > 0">
            <v-badge color="rgb(89,153,80)" :content="notificationCount + requestCount" class="ml-auto ma-5 mt-4 badge-lg">
              <v-icon icon="mdi-arrow-left" class="menu-icon" @click.stop="toWidget('dashboard')"></v-icon>
            </v-badge>
          </div>  
          <div v-else-if="widget === 'editor'">
            
          </div>
          <div v-else>
            <v-icon icon="mdi-arrow-left" class="menu-icon ml-auto ma-5 mt-4" @click.stop="toWidget('dashboard')"></v-icon>
          </div>
          <div>
              <h1 style="font-size: 3rem; position: absolute; width: 100%; top: 10px; z-index: -1" class="text-center"><v-avatar class="mr-5" size="55" style="border: 1.5px solid white;" :image="pfp"></v-avatar>{{username}}</h1>
            </div>
        </v-list-item>
          <v-divider></v-divider>
        </div>

        <v-list density="compact" nav class="custom-nav">
          <div v-if="widget === 'dashboard'">
            <v-list-item title="Notifications" value="notifications" style="color: rgb(152,255,134);" @click="toWidget('notifications')"></v-list-item>  
            <v-badge v-if="notificationCount > 0" color="rgb(89,153,80)" class="badge-lg" :content="notificationCount" style="position: absolute; top: 32px; left: 178px;"></v-badge>           
            <v-list-item title="My Projects" value="projects" @click="toWidget('projects')"></v-list-item>
            <v-list-item title="Search" value="search" style="color: rgb(152,255,134);" @click="toWidget('search')"></v-list-item>
            <v-list-item title="Requests" value="requests" @click="toWidget('requests')"></v-list-item>   
            <v-badge v-if="requestCount > 0" color="rgb(89,153,80)" class="badge-lg" :content="requestCount" style="position: absolute; top: 188px; left: 140px;"></v-badge> 
            <v-list-item title="Friends" value="friends" style="color: rgb(152,255,134);" @click="toWidget('friends')"></v-list-item>
            <v-list-item title="Networks" value="networks" @click="wip()"></v-list-item>
            <v-list-item title="My Posts" value="posts" style="color: rgb(152,255,134);" @click="toWidget('posts')"></v-list-item>
            <v-list-item title="Island Editor" value="editor" @click="toWidget('editor')"></v-list-item>
            <v-list-item title="Settings" value="settings" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
            <v-list-item title="Sign Out" value="signout" @click="showSignOut = true"></v-list-item>
          </div>  
          <Notifications ref="notificationsRef" :notificationCount="notificationCount" :readCount="readCount" @read-notification="notificationCount--; readCount++;" @remove-notification="notificationCount--" @remove-all-notifications="notificationCount = 0; readCount = 0" v-if="widget === 'notifications'">

          </Notifications>
          <Projects ref="projectsRef" @project-success="showSuccessAlertFunc" @project-warning="showWarningAlertFunc" @project-error="showErrorAlertFunc" @project-completed="projectCompleted" v-if="widget === 'projects'">
            
          </Projects>
          <Search ref="searchRef" @user-network-success="showSuccessAlertFunc" v-if="widget === 'search'">

          </Search>  
          <Requests ref="requestsRef" :requestCount="requestCount" @request-success="showSuccessAlertFunc" @remove-request="requestCount--" v-if="widget === 'requests'">

          </Requests>
          <Editor ref="editorRef" @editor-success="showSuccessAlertFunc" v-if="widget === 'editor'">

          </Editor>
          <Friends ref="friendsRef" @visited-friend="visitFriend" @unfriend-friend="showSuccessAlertFunc" v-if="widget === 'friends'">

          </Friends>   
          <Posts ref="postsRef" v-if="widget === 'posts'">

          </Posts>
        </v-list>
      </VResizeDrawer>
        <v-main>
    <div class="h-100">
        <v-row>
        <h1 class="mt-5 mb-0 ml-7"><span v-if="username !== visitedUsername">{{visitedUsername}}'s </span><span v-else>My </span>Points</h1>
        <div v-if="notificationCount + requestCount > 0" class="ml-auto ma-5 mt-8 mr-10 badge-lg">
          <v-badge color="rgb(89,153,80)" :content="notificationCount + requestCount" >
            <v-icon icon="mdi-menu" class="menu-icon" @click.stop="drawer = !drawer"></v-icon>
          </v-badge>
        </div>
        <div class="ml-auto ma-5 mt-8 mr-10 badge-lg" v-else>
          <v-icon icon="mdi-menu" class="menu-icon" @click.stop="drawer = !drawer"></v-icon>
        </div>
            <ul class="ml-7 w-100 mt-n5" style="list-style-type: none;" v-if="friendRPoints < 0">
                <li class="font-weight-bold" style="color: rgb(215,0,0);"><v-icon icon="mdi-emoticon" class="mr-2"></v-icon>{{rPoints}}</li>
                <li class="font-weight-bold" style="color: rgb(151,255,45);"><v-icon icon="mdi-pine-tree" class="mr-2"></v-icon>{{gPoints}}</li>
                <li class="font-weight-bold" style="color: rgb(101,135,231);"><v-icon icon="mdi-cloud" class="mr-2"></v-icon>{{bPoints}}</li>
            </ul>
            <ul class="ml-7 w-100 mt-n5" style="list-style-type: none;" v-else>
                <li class="font-weight-bold" style="color: rgb(215,0,0);"><v-icon icon="mdi-emoticon" class="mr-2"></v-icon>{{friendRPoints}}</li>
                <li class="font-weight-bold" style="color: rgb(151,255,45);"><v-icon icon="mdi-pine-tree" class="mr-2"></v-icon>{{friendGPoints}}</li>
                <li class="font-weight-bold" style="color: rgb(101,135,231);"><v-icon icon="mdi-cloud" class="mr-2"></v-icon>{{friendBPoints}}</li>
            </ul>
            
        </v-row>
        <v-row class="mt-n5 mx-1">
          <!-- replace with friends island when friend is visited -->
          <v-col cols="12" class="text-center mt-n10">
              <img style="min-width: 55vw; max-width: 80vw;" src="/island.png" alt="island">
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
</style>
<script src="./js/Dashboard.js">
</script>