<template>
    <div>
    <v-row>
        <h1 class="header-h1 ml-5 mb-5 mt-3">Notifications</h1>
        <v-btn variant="outlined" class="refresh-btn mt-4 ml-3" size="small" icon="mdi-refresh" @click="getNotifications()"></v-btn>
    </v-row>
    <v-row class="mb-3 mt-n3 ml-2" v-if="notifications.message === undefined && loaded">
        <v-btn :disabled="readCount === notifications.length" color="primary" variant="outlined" @click="markAllRead()">Mark all as read</v-btn>
        <v-btn color="red" variant="outlined" class="ml-3" @click="deleteAll()">Delete all</v-btn>
    </v-row>
    <div class="mt-5 text-center" v-else-if="!loaded">
        <h1><i>Loading...</i></h1>
    </div>
    
    <v-list-item v-for="notification in filteredNotifications" :key="notification.Id" :class="{ '': notification.Read, 'new-notif': !notification.Read }">
        <hr style="background-color: grey; border-color: grey; color: grey; height: 1px;">
        <pre class="text-muted">{{notification.Datetime}}</pre>
        {{notification.Message}}
        <v-row class="my-0" justify="space-around">
            <v-col cols="12">
                <v-btn v-if="!notification.Read" class="mr-3" color="primary" variant="outlined" size="small" @click="read(notification)">Mark as read</v-btn>
                <v-btn color="red" variant="outlined" size="small" @click="del(notification)">Delete</v-btn>
            </v-col>
        </v-row>
    </v-list-item>
    <v-list-item v-if="notifications.message !== undefined && loaded">
        <h1 class="text-center mt-5"><i>No new notifications...</i></h1>
    </v-list-item>
    </div>
</template>
<style scoped>
    pre {
        white-space: pre-wrap;
        word-wrap: break-word;
    }
    .header-h1 {
        font-size: 2rem;
        color: rgb(152,255,134);
    }
    .text-muted {
        color: grey;
    }
    .refresh-btn {
        border-radius: 10px;
    }
    .new-notif {
        background-color: rgba(255,255,255,0.08);
    }
</style>
<script src="./js/Notifications.js">
</script>