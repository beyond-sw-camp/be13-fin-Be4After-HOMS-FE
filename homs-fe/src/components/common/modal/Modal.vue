<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-gray-900 opacity-60"></div>
  
      <!-- 모달 내용 -->
      <div class="relative bg-white shadow-lg w-full max-w-md text-center z-10 pb-10">
        <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-4 p-2">
          <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="$emit('confirm')">
        </div>
        <p class=" p-6 text-gray-700 font-bold text-sm">
          <slot>
            헬프데스크 문의 안내<br>
            (운영시간 09:00 ~ 17:00) <br>
            (점심시간 12:30 ~ 13:30) <br><br>
          </slot>
          <slot>
                ※ 문의 전 체크사항 <br>
                - 로그인 아이디는 <span class=" font-bold text-blue-700 text-xl">사업자등록번호 (10자리)</span> 입니다.
            </slot>
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import xmark from '@/assets/xmark.svg'
    defineProps({
        visible: Boolean
    })
    defineEmits(['confirm'])
  </script>
  