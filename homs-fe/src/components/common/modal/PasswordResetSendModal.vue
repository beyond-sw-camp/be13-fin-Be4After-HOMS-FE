<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-gray-900 opacity-60"></div>
      <div class="relative bg-white shadow-lg w-1/3 max-w-5xl text-center z-10 pb-10">
        <div class="flex justify-center bg-slate-700 text-white text-xl font-semibold mb-2 p-2">
            알림
        </div>

        <div class="flex w-full justify-center gap-x-5 mt-10 items-center">
            <img :src="exclamation" alt="느낌표" class="w-15 h-15">
            <p class="flex text-start text-sm">
                입력하신 E-mail로 임시 비밀번호가 발급되었습니다.
            </p>
        </div>

        <div class="flex justify-center mt-5">
            <button @click="onClose" class="px-6 py-3 w-1/6 bg-orange-600 text-white font-bold  hover:bg-orange-700 transition">
                확인
            </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import exclamation from "@/assets/exclamation.svg"

  defineProps({
    visible: Boolean,
    formData: Object
  })

  const emit = defineEmits(['close'])
  
  function onClose() {
    emit('close')
  }

  </script>
  