<template>
  <div class="flex flex-col items-center justify-center min-h-screen w-full">
    <img :src="logo" alt="한화 로고" class=" w-xs h-auto" />
    <h1 class="text-4xl font-bold mt-4">404 NOT FOUND</h1>
    <h1 class="text-4xl font-bold mt-4">이런...잘못된 경로 입니다...</h1>

    <button @click="goBack"
      class="mt-6 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md transition-all">돌아가기</button>
  </div>
</template>

<script setup>
  import logo from '@/assets/homsLogo.png'

  const goBack = () => {
    window.history.back()
    }
  </script>