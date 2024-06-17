<template>
    <div>
        <h1 class="header-h1 ml-2 mt-0 mb-1">Friends</h1>
        <v-list-item v-for="friend in friends" :key="friend.id">
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
    <v-list-item v-if="friends.length === 0">
        <h1 class="ml-0"><i>You have no friends</i></h1>
    </v-list-item>
    </div>
</template>
<style scoped>
.header-h1 {
    font-size: 2rem;
    color: rgb(152,255,134);
}
</style>
<script src="./js/Friends.js">
</script>