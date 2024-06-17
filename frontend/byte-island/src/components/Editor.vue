<template>
<div>
    <h1 class="header-h1 ml-2 mb-5">Island {{ editorView.charAt(0).toUpperCase() + editorView.slice(1) }}</h1>
    
    <div v-if="editorView === 'editor'">
        <v-list-item title="Shop" value="shop" @click="wip()"></v-list-item>
        <v-list-item title="Inventory" value="inventory" style="color: rgb(152,255,134);" @click="wip()"></v-list-item>
    </div>
    
    <Shop ref="shopRef" :requestCount="requestCount" @request-success="showSuccessAlertFunc" @remove-request="requestCount--" >
        
    </Shop>
    <Inventory ref="inventoryRef" @editor-success="showSuccessAlertFunc">

    </Inventory>

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