<template>
  <div class="flex h-screen">
    <SideBar />
    <FloatingChat />

    <div class="flex flex-col flex-1">
      <AppHeader />

      <main class="flex-1 overflow-y-auto p-6 lg:ml-[290px]">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppHeader from './AppHeader.vue';
import SideBar from './SideBar.vue';
import FloatingChat from './FloatingChatApp.vue';

</script>

<style scoped></style>