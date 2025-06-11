<template>
  <div>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-gray-900 opacity-60"></div>
      <div class="relative bg-white shadow-lg w-full max-w-5xl text-center z-10 pb-10">
        <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-2 p-2">
          <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="onClose">
        </div>
        <p class="mb-6 text-gray-700 text-2xl font-extrabold">
            파트너사 신규 등록
        </p>
        <!-- input영역 -->
        <div class="grid grid-cols-3 mx-10">

            <!-- 국가 -->
            <label class="flex pl-3 h-full items-center bg-gray-200 border border-gray-400 font-semibold self-center">국가</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <select v-model="form.contury" class="flex w-1/3 border border-gray-400 bg-yellow-50 ">
                    <option value="" >국가 선택</option>
                    <option value="KR">한국</option>
                    <option value="US">미국</option>
                </select>
            </div>

            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">파트너사명</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.companyName" type="text" class=" flex w-1/3 border border-gray-400 text-md ">
            </div>

            <!-- 사업자 등록번호 -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">사업자 등록번호</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.companyNumber" type="text" placeholder="000-00-00000" class="flex w-1/3 border border-gray-400 text-md">
            </div>

            <!-- 대표자명 -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">대표자명</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.ceoName" type="text" class="flex w-1/3 border border-gray-400 text-md">
            </div>

            <!-- 대표전화번호 -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">대표전화번호</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.telNumber" type="text" class="flex w-1/3 border border-gray-400 text-md">
            </div>

            <!-- 대표모바일번호(이건 사용할지 여부 develop하면서 결정하자) -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">대표모바일번호</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.phoneNumber" type= "text" class="flex w-1/3 border border-gray-400 text-md">
            </div>

            <!-- 담당자명 -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">대표담당자명</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.managerName" type="text" class="flex w-1/3 border border-gray-400 text-md">
            </div>

            <!-- 담당자Email -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">대표담당자 E-mail</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.managerEmail" type="text" class="flex w-1/3 border border-gray-400 text-md">
            </div>
        </div>

        <div class="flex gap-10 justify-center mt-5">
            <button @click="signUpPartner" class="px-6 py-3 w-1/6 bg-orange-600 text-white font-bold  hover:bg-orange-700 transition">
                저장
            </button>
            <button @click="onClose" class="px-6 py-3 w-1/6 bg-slate-500 text-white font-bold hover:bg-slate-600 transition">
                취소
            </button>
        </div>

      </div>
    </div>
    
    <PartnerRegisterSaveModal :visible="showSuccess" :formData="form" @close="onConfirmModalClose" />
  </div>
</template>
  
  <script setup>
  import xmark from '@/assets/xmark.svg'
  import { reactive, ref } from 'vue'
  import PartnerRegisterSaveModal from './PartnerRegisterSaveModal.vue'
  import apiClient from '@/api'

  const showSuccess = ref(false)


  defineProps({
    visible: Boolean,
  })

  const emit = defineEmits(['close'])

  const form = reactive({
    contury:'',
    companyName:'',
    companyNumber: '',
    telNumber:'',
    ceoName:'',
    phoneNumber:'',
    managerName:'',
    managerEmail:'',
  })

  const signUpPartner = async () => {

    const requestData = {
      country: form.contury === 'KR' ? 'KOREA' : form.contury === 'US' ? 'USA' : '', // 변환 필요
      companyName: form.companyName,
      registrationNumber: form.companyNumber,
      representName: form.ceoName,
      representCall: form.telNumber,
      representPhone: form.phoneNumber,
      representManagerName: form.managerName,
      representManagerEmail: form.managerEmail,
      continueStatus: false,
      approveStatus: false
    }
    const response = await apiClient.post('/company', requestData)
    console.log('파트너사 등록 성공:', response.data)
    showSuccess.value = true
  }

  // 파트너사 등록 모달만 닫는기능
  function onClose() {
    emit('close')
  }

    //하위 모달인 저장확인 모달이 닫히면 같이 닫히는 기능
  function onConfirmModalClose(){
    showSuccess.value = false
    console.log("form", form)
    emit('close')
  }

  </script>
  