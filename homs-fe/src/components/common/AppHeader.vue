<template>
  <header>
    <div class="flex justify-end items-center h-20 px-6 border-b-1 border-gray-200">
      <div class="flex gap-x-2 mr-5">
        <RouterLink :to="{ name: 'Setting' }"
          class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-70">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
            <path
              d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" />
          </svg>
        </RouterLink>
        <button @click="toggleDropdown"
          class="flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-70">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
            <path
              d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" />
          </svg>
          <span class="absolute flex size-3 ml-8 mb-8">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
            <span class="relative inline-flex size-3 rounded-full bg-sky-500"></span>
          </span>
        </button>

        <!-- 알림 드롭 박스  -->
        <div v-if="isOpen"
          class="absolute z-10 mt-16 right-55 w-64 origin-top-right rounded-md border border-gray-200 bg-white shadow-lg">
          <div class="py-2 px-4 text-sm text-gray-700">
            <div v-if="notifications.length === 0">
              새로운 알림이 없습니다.
            </div>
            <ul v-else>
              <li v-for="(notification, index) in notifications" :key="index"
                class="py-2 border-b border-gray-100 last:border-0">
                {{ notification }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <span class="overflow-hidden rounded-full h-11 w-11">
          <img :src="logoImg" alt="logo" class="object-cover w-full h-full" />
        </span>
        <div v-if="authStore.user">{{ authStore.user.managerName ?? '사용자' }}</div>
        <div v-else>로그인 중...</div>
        <div class="cursor-pointer hover:underline" @click="Logout">Logout</div>
      </div>
    </div>
  </header>
</template>

<script setup>
import logoImg from '@/assets/homsLogo.png'
import { ref } from 'vue';
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/states/auth';
import apiClient from '@/api';

const { t } = useI18n()
const isOpen = ref(false)
const router = useRouter();
const authStore = useAuthStore();

  
// 로그 아웃 기능 구현
async function Logout(){
  try {
    // accessToken을 Authorization 헤더에 담아서 보내기
    if(authStore.accessToken){
      await apiClient.post('/auth/signout', null, {
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`
        }
      });
    }
  } catch (err) {
    console.warn('Logout API failed (probably due to expired token):', err)
  } finally {
    authStore.clearAuth();  // 상태 초기화 (토큰, 유저정보 등)
    router.push('/login');  // 로그인 페이지로 이동
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

// 추후에 DB에서 받을 예정
const notifications = ref([
  '새 주문이 도착했습니다.',
  '결제 대기 중인 주문이 있습니다.',
  '상품 문의가 등록되었습니다.',
])

</script>