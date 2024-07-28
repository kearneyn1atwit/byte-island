<template>
    <div>
        <h1 class="header-h1 ml-2 mt-0 mb-1">Search</h1>
        <v-btn-toggle rounded class="mx-2 toggle-group" v-model="searchTab" mandatory>
            <v-btn @click="updateSearch()" class="ma-1 toggle-btn" size="x-large" color="#98FF86">Users</v-btn>
            <v-btn @click="updateSearch()" class="ma-1 toggle-btn" size="x-large" color="#98FF86">Networks</v-btn>
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
        <h2 v-if="!loaded" class="text-center mt-5"><i>Loading...</i></h2>
        <h2 v-if="!search && loaded" class="text-center mt-5"><i>No {{searchFor}}s found...</i></h2>
        <div v-else>
            <h2 v-if="filteredList.length === 0 && loaded" class="text-center mt-5"><i>No {{searchFor}}s found...</i></h2>
            <v-list-item v-for="(userNetwork,index) in filteredList" :key="userNetwork.id">
                <hr v-if="index > 0" style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5">
                <v-row align="center">
                    <v-col cols="auto">
                        <v-avatar class="ml-5 mr-n5" size="55" style="border: 1.5px solid white;" :image="'data:image/jpg;base64,'+userNetwork.pic"></v-avatar>
                    </v-col>
                    <v-col class="mx-5">
                        <pre class="user-network-name">{{userNetwork.name}}</pre>
                        <div class="text-muted" v-if="searchTab === 1">
                            <pre style="white-space: pre-wrap; word-wrap: break-word;" v-if="userNetwork.showDesc || userNetwork.desc.length <= 100"><b>About</b>: {{userNetwork.desc}}</pre>
                            <pre style="white-space: pre-wrap; word-wrap: break-word;" v-else><b>About</b>: {{userNetwork.desc.substring(0,100)}}...</pre>
                            <div v-if="userNetwork.desc.length > 100">
                                <pre><span class="desc-text" @click="userNetwork.showDesc = !userNetwork.showDesc" v-if="!userNetwork.showDesc">Read more</span></pre>
                                <pre><span class="desc-text" @click="userNetwork.showDesc = !userNetwork.showDesc" v-if="userNetwork.showDesc">Hide description</span></pre>         
                            </div>
                        </div>
                        <!-- <pre class="text-muted" v-if="searchTab === 1">{{userNetwork.desc}}</pre> -->
                    </v-col>
                </v-row>
                
                <v-row v-if="searchTab === 0" class="my-0 mb-n3" justify="space-around">
                    <v-col cols="12">
                        <v-btn color="#98FF86" class="ml-5 mt-1" variant="outlined" size="small" @click="friend(userNetwork)" :disabled="username === userNetwork.name">Friend</v-btn>
                    </v-col>
                </v-row>
                <v-row v-else-if="searchTab === 1 && !userNetwork.inNetwork" class="my-0 mb-n3" justify="space-around">
                    <v-col cols="12">
                        <v-btn color="#98FF86" class="ml-5 mt-1" variant="outlined" size="small" @click="askToJoin(userNetwork)">Ask to Join</v-btn>
                    </v-col>
                </v-row>
                <v-row else class="mb-0"></v-row>
            </v-list-item>
        </div>
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
.desc-text {
    color: #2196F3;
    text-decoration: underline;
    cursor: pointer;
}
.desc-text:hover {
    color: #8fcaf9;
}
</style>
<script src="./js/Search.js">
</script>