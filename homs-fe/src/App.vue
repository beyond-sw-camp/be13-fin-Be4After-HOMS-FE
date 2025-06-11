<template>
    <div>
        <RouterView />
        <Loading />
    </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import Loading from "./components/common/Loading.vue";
</script>

<style scoped></style>
