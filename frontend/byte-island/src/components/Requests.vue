<template>
    <div>
    <v-row>
        <h1 class="header-h1 ml-5 mb-5 mt-3">Requests</h1>
        <v-btn variant="outlined" class="refresh-btn mt-4 ml-3" size="small" icon="mdi-refresh" @click="getRequests(searchTab)"></v-btn>
        <v-btn-toggle rounded class="mx-5 toggle-group mb-5" v-model="searchTab" mandatory>
            <v-btn @click="getRequests(searchTab)" class="ma-1 toggle-btn" size="x-large" color="#98FF86">Friends</v-btn>
            <v-btn @click="getRequests(searchTab)" class="ma-1 toggle-btn" size="x-large" color="#98FF86">Networks</v-btn>
        </v-btn-toggle>
    </v-row>
    
    <v-list-item v-for="(request,index) in requests" :key="request.id">
        <pre class="text-muted">{{request.datetime}}</pre>
        {{request.message}}
        <v-row class="my-0" justify="space-around">
            <v-col cols="12">
                <v-btn color="success" variant="outlined" size="small" @click="accept(request)">Accept</v-btn>
                <v-btn color="secondary" class="ml-3" variant="outlined" size="small" @click="ignore(request)">Ignore</v-btn>
                <v-btn v-if="searchTab === 0" color="red" class="ml-3" variant="outlined" size="small" @click="block(request)">Block User</v-btn>
            </v-col>
        </v-row>
        <hr v-if="index !== requests.length-1" style="background-color: grey; border-color: grey; color: grey; height: 1px;">
    </v-list-item>
    <v-list-item v-if="requests.length === 0">
        <h1 class="ml-0"><i>No new requests</i></h1>
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
    .refresh-btn {
        border-radius: 10px;
    }
    .toggle-group {
    border-radius: 10px !important;
    height: 100%;
    border: 3px solid #98FF86;
    width: calc(100% - 8px);
    }
    .toggle-btn {
        width: calc(50% - 8px);
        border-radius: 5px !important;
        height: 35px !important;
    }
</style>
<script src="./js/Requests.js">
</script>