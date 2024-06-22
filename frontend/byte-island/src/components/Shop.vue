<template>
<div>

    <h1 class="header-h1 ml-2 mt-0 mb-1">Search</h1>
    <h2 class="ml-2 mt-3 mb-1">Search for...</h2>
    <v-btn-toggle rounded class="mx-2 toggle-group" id="pointColorSearchGroup" v-model="searchTab" mandatory>
        <v-btn @click="updateCategory()" class="ma-1 toggle-btn" size="x-large" color="#DDDDDD">ALL</v-btn>
        <v-btn @click="updateCategory()" class="ma-1 toggle-btn" size="x-large" color="#FF9095">RED</v-btn>
        <v-btn @click="updateCategory()" class="ma-1 toggle-btn" size="x-large" color="#A3FFC9">GRN</v-btn>
        <v-btn @click="updateCategory()" class="ma-1 toggle-btn" size="x-large" color="#7DAEFF">BLU</v-btn>
    </v-btn-toggle>

    <v-text-field
        v-model="search"
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
        class="ml-2 my-5 italic-search"
        @input=""
    ></v-text-field>

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