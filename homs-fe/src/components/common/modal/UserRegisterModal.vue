<template>
  <div>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-gray-900 opacity-60"></div>
      <div class="relative bg-white shadow-lg w-full max-w-5xl text-center z-10 pb-10">
        <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-2 p-2">
          <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="onClose">
        </div>
        <p class="mb-6 text-gray-700 text-2xl font-extrabold">
            신규 계정 생성
        </p>
        <!-- input영역 -->
        <div class="grid grid-cols-3 mx-10">

            <!-- 사용자 ID -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">사용자 ID</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.userName" type="text" class=" flex w-1/3 border border-gray-400 text-md ">
            </div>

            <!-- 비밀번호 -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">비밀번호</label>
            <div class="col-span-2 p-2 border border-gray-400 flex items-center gap-2">
              <input :type="passwordType"
                  v-model="form.password"
                  placeholder="비밀번호"
                  class="w-1/3 border border-gray-400 text-md px-2"
                />
                <img
                  :src="passwordType === 'password' ? eyeIcon : eyeSlashIcon"
                  @click="togglePassword"
                  class="w-5 h-5 cursor-pointer"
                  alt="비밀번호 보기 토글"
                />
            </div>

            <!-- 담당자명 -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">담당자명</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.managerName" type="text" class="flex w-1/3 border border-gray-400 text-md">
            </div>

            <!-- 담당자Email -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">담당자 E-mail</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.managerEmail" type="text" class="flex w-1/3 border border-gray-400 text-md">
            </div>

            <!-- 담당자 전화번호 -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">담당자 전화 번호</label>
            <div class="col-span-2 p-2 border border-gray-400">
                <input v-model="form.managerPhone" type="text" class="flex w-1/3 border border-gray-400 text-md">
            </div>

            <!-- 권한 -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">사용자 권한</label>
            <div class="col-span-2 p-2 border border-gray-400">
              <select v-model="form.role" class="flex w-1/3 border border-gray-400 text-md">
                <option >---선택---</option>
                <option value="ROLE_USER">사용자</option>
                <option value="ROLE_ADMIN">관리자</option>
              </select>
            </div>

            <!-- 거래처 ID -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">거래처 ID</label>
            <div class="col-span-2 p-2 border border-gray-400">
              <select v-model="form.companyId" class="flex w-1/3 border border-gray-400 text-md">
                <option value="">---선택---</option>
                <option v-for="company in companyList" :key="company.companyId" :value="company.companyId">
                  {{ company.companyName }}
                </option>
              </select>
            </div>

            <!-- 부서 ID -->
            <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-400 font-semibold self-center">부서</label>
            <div class="col-span-2 p-2 border border-gray-400">
              <select v-model="form.deptId" class="flex w-1/3 border border-gray-400 text-md">
                <option >---선택---</option>
                <option :value="1">영업</option>
                <option :value="2">구매</option>
                <option :value="3">배송</option>
                <option :value="4">자재</option>
              </select>
            </div>

        </div>

        <div class="flex gap-10 justify-center mt-5">
            <button @click="signUpUser" class="px-6 py-3 w-1/6 bg-orange-600 text-white font-bold  hover:bg-orange-700 transition">
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
  import { onMounted, reactive, ref } from 'vue'
  import PartnerRegisterSaveModal from './PartnerRegisterSaveModal.vue'
  import apiClient from '@/api'
  import eyeIcon from '@/assets/eye.svg'
  import eyeSlashIcon from '@/assets/eye-slash.svg'

  const showSuccess = ref(false)
  const passwordType = ref('password')

  defineProps({
    visible: Boolean,
  })

  const emit = defineEmits(['close'])
  const companyList = ref([])

  function togglePassword() {
   passwordType.value = passwordType.value === 'password' ? 'text' : 'password'
  }

  const form = reactive({
    userName:'',
    password:'',
    managerName: '',
    managerEmail:'',
    managerPhone:'',
    role:'',
    companyId:'',
    deptId:'',
  })

  const signUpUser = async () => {
    try {
      const requestData = {
        userName: form.userName,
        password: form.password,
        managerName: form.managerName,
        managerEmail: form.managerEmail,
        managerPhone: form.managerPhone,
        role: form.role,
        companyId: form.companyId,
        deptId: form.deptId,
      }
    
      const response = await apiClient.post('/admin/user', requestData)

      console.log('신규 계정 등록 성공:', response.data)

      // 이메일 보내기
      const requestBody = {
        subject: form.userName,
        content: form.password,
        email: form.managerEmail,
        emailType: "ACCOUNT_CREATED",
      };
      apiClient.post("/notify/email/", requestBody);

      showSuccess.value = true
    } catch (error) {
      console.log(form.managerEmail);
      console.error('신규 계정 등록 실패:', error)
    }
    
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
    location.reload()
  }


onMounted(async () => {
  try {
    const response = await apiClient.get('/admin/company') 
    companyList.value = response.data.data.filter(company => company.approvedStatus === true) 
  } catch (error) {
    console.error('거래처 목록 조회 실패:', error)
  }
})

  </script>
  