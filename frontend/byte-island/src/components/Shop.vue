<template>
<div>
    <h1 class="header-h1 ml-2 mt-0 mb-1">Search</h1>
    <h2 class="ml-2 mt-1 mb-0.5">Search for...</h2>
    <v-btn-toggle rounded class="mx-2 toggle-group" id="pointColorSearchGroup" v-model="searchTab" mandatory>
        <v-btn @click="updateCategory()" class="ma-1 toggle-btn" size="x-large" color="#DDDDDD">ALL</v-btn>
        <v-btn @click="updateCategory()" class="ma-1 toggle-btn" size="x-large" color="#FF9095">RED</v-btn>
        <v-btn @click="updateCategory()" class="ma-1 toggle-btn" size="x-large" color="#A3FFC9">GRN</v-btn>
        <v-btn @click="updateCategory()" class="ma-1 toggle-btn" size="x-large" color="#7DAEFF">BLU</v-btn>
    </v-btn-toggle>

    <v-text-field
        v-model="searchString"
        density="compact"
        :label="'Enter item name...'"
        prepend-inner-icon="mdi-magnify"
        variant="solo-filled"
        bg-color="white"
        flat
        hide-details
        clearable
        @click:clear = "clearSearch()"
        single-line
        class="ml-2 mb-5 mt-3 italic-search"
        @input="getSearchItems(searchCategory,searchString)"
    ></v-text-field>

    <h2 v-if="itemList.length === 0" class="text-center mt-5"><i>No items found...</i></h2>
    <v-list-item v-for="(item,index) in itemList">
        <!-- <hr v-if="index > 0" style="background-color: grey; border-color: grey; color: grey; height: 1px;" class="mb-5"> -->
        <v-row>
            <v-col cols="auto">
                <div style="height:72px; width:72px; border: 3px solid #b3ffd9; border-radius: 8px; background-color: white;">
                    <v-img style="width: 64px; height: 64px; margin: auto; margin-top: 2px" :src="item.image"></v-img>
                </div>
            </v-col>
            <v-col>
                <h3 style="text-transform:capitalize">{{ item.name }}</h3>
                <p> Cost: <span style="color: #FF9095">{{ Math.round(item.RGB/10000) }}</span>, <span style="color: #A3FFC9">{{ Math.round(item.RGB/100%100) }}</span>, <span style="color: #7DAEFF"> {{ Math.round(item.RGB%100) }}</span></p>
                <p style="color: #b3ffd9"> Have: {{ item.inventory }}</p>
            </v-col>
            <v-col>
                <v-btn style="margin: auto; margin-top: 16px; border-radius: 8px; border-width: 3px; width: 48px; height: 48px;" icon="mdi-plus" variant="outlined" color="#00ff80" @click="item.inventory++"></v-btn>
            </v-col>
        </v-row>
    </v-list-item>

</div>
</template>

<style scoped>
.toggle-group {
    border-radius: 10px !important;
    height: 100%;
    border: 3px solid;
    width: calc(100% - 8px);
}
.toggle-btn {
    width: calc(25% - 8px);
    border-radius: 5px !important;
    height: 35px !important;
}
</style>
<script src="./js/Shop.js">
</script>