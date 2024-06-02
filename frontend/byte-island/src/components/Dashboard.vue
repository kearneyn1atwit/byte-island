<template>
<v-card v-if="loaded">
    <v-layout>
      <v-navigation-drawer
        v-model="drawer"
        temporary
        location="right"
        :width="400"
      >
        <v-list-item>
            <v-badge color="green" :content="notifCount" class="ml-auto ma-5 mt-4">
                <v-icon icon="mdi-menu" class="menu-icon" @click.stop="drawer = !drawer"></v-icon>
            </v-badge>
        </v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav class="custom-nav">
          <v-list-item title="Notifications" value="notifications" @click="wip()"></v-list-item>   
          <v-badge color="green" :content="notifCount" style="position: absolute; top: 30px; left: 175px;"></v-badge> 
          <v-list-item title="My Projects" value="projects" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
          <v-list-item title="Search" value="search" @click="wip()"></v-list-item>
          <v-list-item title="Friends" value="friends" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
          <v-list-item title="Networks" value="networks" @click="wip()"></v-list-item>
          <v-list-item title="My Posts" value="posts" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
          <v-list-item title="Island Shop" value="shop" @click="wip()"></v-list-item>
          <v-list-item title="Settings" value="settings" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
          <v-list-item to="/" title="Sign Out" value="signout"></v-list-item>
        </v-list>
      </v-navigation-drawer>
        <v-main style="height: 100vh; background-image: linear-gradient(black 0%, rgb(89,153,80) 100%);">
    <div class="h-100" style="background-image: linear-gradient(black 0%, rgb(89,153,80) 100%);">
        <v-row>
        <h1 class="mt-5 mb-0 ml-7">Points</h1>
        <v-badge color="green" :content="notifCount" class="ml-auto ma-5 mt-8 mr-8">
            <v-icon icon="mdi-menu" class="menu-icon" @click.stop="drawer = !drawer"></v-icon>
        </v-badge>
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
  </v-card>
    
    
    
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
<script src="./js/Dashboard.js">
</script>