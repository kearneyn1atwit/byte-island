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

    <div style="display: flex; flex-wrap: wrap; gap: 3px; justify-content: left;">
        <v-list-item style="padding: 0;">
            <div class="inv-item">
                <p style="text-transform:capitalize; width: 100%; height: 28px; text-align: center; color: grey;">Dig Up Blocks</p>
                <v-btn style="width: 84px; height: 84px; border: 3px solid grey; border-radius: 8px; color: black; font-size: 48px; margin: auto; margin-top: 0; margin-bottom: 32px;" :style="{'background-color': delBg()}" icon="mdi-shovel" id="DEL" @click="selectDel()"/>
            </div>
        </v-list-item>
        <v-list-item v-for="(item) in itemList" style="padding: 0;">
            <div class="inv-item">
                <p style="text-transform: capitalize; width: 100%; height: 28px; text-align: center;" :style="{color: getColor(item.RGB)}">{{ item.name }}</p>
                <v-btn style="width: 84px; height: 84px; margin: auto; margin-top: 2px; border-radius: 8px; color: black; border: solid 3px;" :style="{'border-color': getColor(item.RGB), 'background-color': getBg(item.id)}" :id="item.id" @click="selectBlock(item.id)">
                    <img style="width: 64px; height: 64px; margin: auto;" :src="item.image"/>
                </v-btn>
                <p style="width: 48px; text-align: center; margin: auto;" :style="{color: getColor(item.RGB)}">x00</p>
                <v-btn class="trns-btn" style="width: 32px; height: 32px; margin: auto; border-color: red; color: red; font-size: larger;">$</v-btn>
            </div>
        </v-list-item>
    </div>
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
.inv-item {
    width: 102px;
    height: 152px;
    display: flex; 
    flex-wrap: wrap;
}
.trns-btn {
    min-width: 0;
    min-height: 0;
    padding: 0;
    margin: 0;
    background-color: transparent;
    border: solid 3px;
    border-radius: 8px;
}
</style>
<script src="./js/Inventory.js">
</script>