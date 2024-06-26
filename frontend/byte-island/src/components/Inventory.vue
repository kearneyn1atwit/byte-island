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
</div>
</template>

<style scoped>
</style>
<script src="./js/Inventory.js">
</script>