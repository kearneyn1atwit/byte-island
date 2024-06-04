<template>
    <div>
    <h1 class="header-h1 ml-2 my-5">Notifications</h1>
    
    <v-list-item v-for="(notification,index) in notifications" :key="notification.id">
        <pre class="text-muted">{{notification.time}}</pre>
        {{notification.messageBody}}
        <v-row class="my-0" justify="space-around">
            <v-col cols="12">
                <v-btn color="success" class="ml-5" variant="outlined" size="small" @click="accept(notification)">Accept</v-btn>
                <v-btn color="red" class="ml-5" variant="outlined" size="small" @click="ignore(notification)">Ignore</v-btn>
            </v-col>
        </v-row>
        <hr v-if="index !== notifications.length-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
    </v-list-item>
    <v-list-item v-if="notifications.length === 0">
        <h1 class="ml-0"><i>No new notifications</i></h1>
    </v-list-item>
    </div>
</template>
<style scoped>
    .header-h1 {
        font-size: 2rem;
        color: rgb(152,255,134);
    }
    .text-muted {
        color: grey;
    }
</style>
<script src="./js/Notifications.js">
</script>