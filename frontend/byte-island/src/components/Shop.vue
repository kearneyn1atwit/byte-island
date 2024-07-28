<template>
<div>
    <v-dialog v-model="buyNew" v-if="buyNew" max-width="500" min-height="300" scrollable persistent>
        <template v-slot:default="{}">
                <v-card title="Purchasing: " style="padding: 10px"> <div :style="{'position': 'absolute', 'left': '160px', 'top': '6px', 'padding': '3px'}"><v-img :style="{'width': '64px', 'height': '64px'}" :src="'/'+mapNumToHex(this.purchaseId)+'.png'"></v-img></div>
                    <v-card-text style="border-top: 1.5px solid gray; margin-top: 0.5rem;"></v-card-text>
                    <h3 class="ml-3 mt-n4" id="howmany" style="color: white">How many?</h3>
                    <v-text-field clearable counter="3" persistent-counter maxlength="3" style="width: 95%; margin: auto" variant="outlined" type="number" class="mt-3 mb-n5" placeholder=0 persistent-placeholder v-model="purchaseAmnt"></v-text-field>
                    <h4 class="ma-2 mt-3 ml-3" id="totalCost" :style="{color: purchaseColor}">Total Cost: {{ displayCost() }} {{ purchaseType }} points</h4>
                    <h4 class="ma-2 mt-1 ml-3" id="totalCost" :style="{color: purchaseColor}">Your {{ purchaseType }} Points After Purchase: {{ getPoints[this.purchaseCat]-displayCost() }}</h4>
                    <v-card-actions class="mb-3" style="border-top: 1.5px solid gray;">
                        <v-spacer></v-spacer>
                        <v-btn
                        text="Cancel"
                        class="mr-3 mt-3"
                        variant="outlined"
                        color="red"
                        @click="buyNew = false; purchaseAmnt = 0;"
                        ></v-btn>
                        <v-btn
                        class="mr-3 mt-3"
                        :disabled="purchaseAmnt===0 || !canPurchase() || !numericOnly(purchaseAmnt)"
                        text="Purchase"
                        variant="outlined"
                        color="primary"
                        @click="finishPurchaseItem()"
                        ></v-btn>
                    </v-card-actions>
            </v-card>
        </template>
    </v-dialog>

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
                    <v-img style="width: 64px; height: 64px; margin: auto; margin-top: 2px" :src="'/'+mapNumToHex(item.Id)+'.png'" :alt="item.Id+'.png'"></v-img>
                </div>
            </v-col>
            <v-col>
                <h3 style="text-transform:capitalize">{{ item.Name }}</h3>
                <p> Cost: <span :style="{color: getColor(item.Category)}">{{ item.Points }} {{ mapCategory(item.Category) }} </span> Points</p>
                <p :style="{color: getColor(item.Category)}"> Have: {{ item.Inventory }}</p>
            </v-col>
            <v-col>
                <v-btn style="margin: auto; margin-top: 16px; border-radius: 8px; border-width: 3px; width: 48px; height: 48px;" icon="mdi-plus" variant="outlined" color="#00ff80" @click="purchaseItem(item.Id)"></v-btn>
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