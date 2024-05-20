<template>
    <h1>This is a routing test. {{ testVal }}</h1>
    <v-btn @click="valInc()">Increase number</v-btn>
    <v-btn class="mt-5 d-block" @click="this.$router.back()">Go Back</v-btn>
</template>
<script src="./js/RouterTest.js">
</script>
