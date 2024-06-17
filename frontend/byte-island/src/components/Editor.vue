<template>
<div>
    <h1 class="header-h1 ml-2 mb-5">Island Editor</h1>
    <v-list-item title="Shop" value="shop" @click="wip()"></v-list-item>
    <v-list-item title="Inventory" value="inventory" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
</div>
</template>

<style>
    .header-h1 {
        font-size: 2rem;
        color: rgb(152,255,134);
    }
    .text-muted {
        color: grey;
    }
</style>
<script src="./js/Editor.js">
</script>