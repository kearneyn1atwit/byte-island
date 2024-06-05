<template>
    <div>
        <h1 class="header-h1 ml-2 mt-0 mb-1">Search</h1>
        <v-btn-toggle rounded class="mx-2 toggle-group" v-model="searchTab" mandatory>
            <v-btn @click="updateSearch()" class="ma-1 toggle-btn" size="x-large" color="#98FF86">Users</v-btn>
            <v-btn @click="updateSearch()" class="ma-1 toggle-btn" size="x-large" color="#98FF86">Networks</v-btn>
        </v-btn-toggle>
        <h2 class="ml-2 mt-3 mb-1">Search by...</h2>
        <v-btn-toggle rounded class="mx-2 toggle-group" v-model="searchByTab" mandatory>
            <v-btn @click="updateSearch()" class="ma-1 toggle-btn toggle-btn-sm" color="#98FF86">Name</v-btn>
            <v-btn @click="updateSearch()" class="ma-1 toggle-btn toggle-btn-sm" color="#98FF86">ID</v-btn>
        </v-btn-toggle>
        <v-text-field
                v-model="search"
                density="compact"
                :label="'Search for ' + searchFor + ' by ' + searchBy"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                bg-color="white"
                flat
                hide-details
                clearable
                @click:clear = "clearSearch()"
                single-line
                class="ml-2 my-5 italic-search"
                @input="getUsersNetworks(searchTab,searchByTab,search)"
        ></v-text-field>
        <h2 v-if="!search" class="text-center mt-5"><i>No {{searchFor}}s found...</i></h2>
        <div v-else>
            <h2 v-if="filteredList.length === 0" class="text-center mt-5"><i>No {{searchFor}}s found...</i></h2>
            <v-list-item v-for="(userNetwork,index) in filteredList" :key="userNetwork.id">
                <hr v-if="index > 0" style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                <pre class="ml-5 user-network-name">{{userNetwork.name}}</pre>
                <pre class="text-muted ml-5">ID: #{{userNetwork.id}}</pre>
                <v-row v-if="searchTab === 0" class="my-0" justify="space-around">
                    <v-col cols="12">
                        <v-btn color="#98FF86" class="ml-5" variant="outlined" size="small" @click="friend(userNetwork)">Friend</v-btn>
                        <v-btn color="red" class="ml-3" variant="outlined" size="small" @click="block(userNetwork)">Block</v-btn>
                    </v-col>
                </v-row>
                <v-row v-else class="my-0" justify="space-around">
                    <v-col cols="12">
                        <v-btn color="#98FF86" class="ml-5" variant="outlined" size="small" @click="askToJoin(userNetwork)">Ask to Join</v-btn>
                    </v-col>
                </v-row>
            </v-list-item>
        </div>
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
.toggle-btn-sm {
    height: 25px !important;
}
.user-network-name {
    font-size: 1.25rem;
}
</style>
<script src="./js/Search.js">
</script>