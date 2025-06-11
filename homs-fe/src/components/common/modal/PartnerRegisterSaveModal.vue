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
                등록 요청이 완료되었습니다 <br>
                관리자의 승인 후 사용 가능합니다.
            </p>
        </div>

        <!-- 데이터 넘어오는지 확인용(추후 삭제 예정) -->
        <div class="text-left px-10 py-4 text-gray-800 hidden">
            <p v-for="(value, key) in formData" :key="key" class="mb-2">
            <strong>{{ key }}:</strong> {{ value || '값 없음' }}
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
  