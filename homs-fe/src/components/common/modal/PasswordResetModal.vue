<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-gray-900 opacity-60"></div>
      <div class="relative bg-white shadow-lg w-full max-w-2/5 text-center z-10 pb-10">
        <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-2 p-2">
          <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="onClose">
        </div>
        <p class="mb-6 text-gray-700 text-2xl font-extrabold">
            비밀번호 찾기
        </p>
        <!-- input영역 -->
        <div class="grid grid-cols-3 mx-10 gap-y-5">

            <!-- 아이디 -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-200 font-semibold self-center">
                아이디
            </label>
            <div class="col-span-2 p-2 border border-gray-200">
                <input v-model="resetPwform.userId" type="text" class=" flex w-1/2 border border-gray-300 text-md ">
            </div>
        </div>

        <div>
            <p class="my-5 font-semibold">파트너사 초기 계정: 로그인 아이디는 사업자 <span class="text-xl font-bold text-blue-600">등록번호 10자리</span> 입니다.</p>
            <div class="grid grid-cols-2 gap-x-3 pr-20">
                <p class="flex items-center justify-end font-bold text-center text-xl text-orange-500 ">
                    기타문의
                </p>
                <div class="flex flex-col justify-start">
                    <p class="flex justify-start font-semibold">e-mail : Ohglory@gmail.com</p>
                    <p class="flex justify-start font-semibold">연락처 : 010-2294-8826</p>
                </div>
            </div>
        </div>

        <div class="flex gap-10 justify-center mt-5">
            <button @click="onSave" class="px-6 py-3 w-1/6 bg-orange-600 text-white font-bold  hover:bg-orange-700 transition">
                확인
            </button>
            <button @click="onClose" class="px-6 py-3 w-1/6 bg-slate-500 text-white font-bold hover:bg-slate-600 transition">
                취소
            </button>
        </div>

      </div>
    </div>
    
    <PasswordResetSendModal :visible="showSuccess" :FormData="resetPwform" @close="onConfirmModalClose" />
  </template>
  
  <script setup>
  import xmark from '@/assets/xmark.svg'
  import { reactive, ref } from 'vue'
  import PasswordResetSendModal from './PasswordResetSendModal.vue'
  import apiClient from '@/api'
  

  const showSuccess = ref(false)

  defineProps({
    visible: Boolean,
  })

  const emit = defineEmits(['close'])

  const resetPwform = reactive({
    userId:'',
  })

  // 비밀번호 초기화 모달만 닫는기능
  function onClose() {
      emit('close')
      clearForm()
  }

  function generateRandomPassword(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }


  async function onSave(){
    try {
    const response = await apiClient.get('/admin/user');
    const users = response.data.data;

    const matchedUser = users.find(user => user.userName === resetPwform.userId);

    if (!matchedUser) {
      alert('해당 아이디를 가진 사용자를 찾을 수 없습니다.');
      return;
    }

    // 사용자 정보 출력
    console.log('🔍 유저 정보 조회 결과');
    console.log('✔ 유저 ID:', matchedUser.userId);
    console.log('✔ 유저 이름:', matchedUser.userName);
    console.log('✔ 담당자 이름:', matchedUser.managerName);
    console.log('✔ 이메일:', matchedUser.managerEmail);

    // 랜덤 비밀번호 생성
    const newPassword = generateRandomPassword();
    console.log('🆕 생성된 임시 비밀번호:', newPassword);

    // 비밀번호 초기화 요청
    const updatePayload = {
      managerName: matchedUser.managerName,
      managerEmail: matchedUser.managerEmail,
      managerPhone: matchedUser.managerPhone,
      newPassword: newPassword,
    };

    await apiClient.put(`/user/${matchedUser.userId}`, updatePayload);

    const emailPayload = {
      id: "",
      email: matchedUser.managerEmail,
      subject: "[HOMS] 비밀번호가 초기화되었습니다.",
      content: `새 비밀번호는 다음과 같습니다: ${newPassword}`,
      emailType: "PASSWORD_RESET", // 새 enum 값 (백엔드에 정의 필요)
    };

    apiClient.post("/notify/email/", emailPayload);

    alert('✅ 비밀번호 초기화가 완료되었습니다.');
    showSuccess.value = true;
    clearForm();
  } catch (error) {
    console.error('❌ 비밀번호 초기화 중 오류 발생:', error);
    alert('비밀번호 초기화에 실패했습니다.');
  }}

  function clearForm(){
      resetPwform.userEmail = ""
      resetPwform.userId = ""
  }

    //하위 모달인 임시 비밀번호 발급 모달이 닫히면 같이 닫히는 기능
  function onConfirmModalClose(){
    showSuccess.value = false
    emit('close')
  }

  </script>
  