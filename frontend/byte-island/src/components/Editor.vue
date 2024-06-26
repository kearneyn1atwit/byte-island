<template>
<div>
    <h1 class="header-h1 ml-2 mb-5">Island {{ editorView.charAt(0).toUpperCase() + editorView.slice(1) }}</h1>
    
    <div v-if="editorView === 'editor'">
        <v-list-item title="Shop" value="shop" @click="toEditorView('shop')"></v-list-item>
        <v-list-item title="Inventory" value="inventory" style="color: rgb(152,255,134);" @click="toEditorView('inventory')"></v-list-item>
    </div>
    
    <Shop ref="shopRef" v-if="editorView === 'shop'">
        
    </Shop>
    <Inventory ref="inventoryRef" v-if="editorView === 'inventory'">

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