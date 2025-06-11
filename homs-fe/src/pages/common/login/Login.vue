<template>
    <!-- 배경 비디오 -->
    <video autoplay loop muted class="fixed w-2/3 h-full top-0 left-0h-full object-cover ">
        <source :src="backgroundVideo" type="video/mp4" />
    </video>
    <div class="fixed w-1/3 h-full top-0 right-0 flex justify-center items-center">
        <div class="flex flex-col h-1/2 w-full bg-white p-16 ">
            <div class="flex w-full justify-center font-extrabold text-3xl mb-5">
                LOGIN
            </div>
            <!-- 번역 구현은 어떻게 할지 -->
            <div class="text-xs flex justify-end mb-2 gap-2 cursor-pointer">
                <span :class="selectedLang === 'KOR' ? 'font-bold underline' : 'text-gray-500'"
                    @click="selectedLang = 'KOR'"> KOR</span>
                |
                <span :class="selectedLang === 'ENG' ? 'font-bold underline' : 'text-gray-500'"
                    @click="selectedLang = 'ENG'">ENG</span>
            </div>
            <!-- 로그인 폼 -->
            <form @submit.prevent="onSubmit">
                <div class="mb-4">
                    <input 
                        v-model="credentials.username"
                        placeholder="ID" 
                        type="text" 
                        class="w-full px-4 py-3  bg-gray-300 font-bold" 
                    />
                </div>
                <div class="mb-6">
                    <input
                        v-model="credentials.password" 
                        placeholder="PW" 
                        type="password" 
                        class="w-full px-4 py-3 bg-gray-300 font-bold" 
                    />
                </div>
                <button 
                    type="submit"
                    class="w-full bg-orange-500 text-white py-4 hover:bg-orange-600 transition font-bold cursor-pointer"
                    >
                    {{ $t('login') }}
                </button>
            </form>
            <!-- 로그인 옵션 부분 -->
            <div class="flex w-full justify-between mt-2">
                <div class="flex">
                    <input type="checkbox" id="saveId" class="cursor-pointer" v-model="saveId">
                    <label for="saveId" class="ml-1 font-semibold text-xs cursor-pointer" >
                      {{ $t('saveId') }}
                    </label>
                </div>
                <div class="flex">
                    <p @click="showPasswordResetModal = true" class=" underline font-semibold text-xs cursor-pointer">
                        {{ $t('resetPassword') }}
                    </p>
                </div>
            </div>
            <div class="w-full border border-gray-300 mt-5"></div>
            <div @click="showRegisterModal = true"
                class="inline-flex w-fit px-6 py-1  border border-gray-300 text-sm font-bold mx-auto mt-5 hover:bg-gray-400 transition cursor-pointer">
                {{ $t('register') }}
            </div>
        </div>
    </div>
    <!-- 집입시 모달 보이기 -->
    <Modal :visible="showModal" @confirm="confirmModal" />
    <PartnerRegisterModal :visible="showRegisterModal" @close="showRegisterModal = false" />
    <PasswordResetModal :visible="showPasswordResetModal" @close="showPasswordResetModal = false" />
    <ConfirmModal
      :visible="showErrorModal"
      :alert="true"
      :text="errorMessage"
      @update:visible="showErrorModal = false"
    />

</template>

<script setup lang="ts">
  import backgroundVideo from '@/assets/hanwha_chemical.mp4'
  import Modal from '@/components/common/modal/Modal.vue';
  import PartnerRegisterModal from '@/components/common/modal/PartnerRegisterModal.vue';
  import PasswordResetModal from '@/components/common/modal/PasswordResetModal.vue';
  import { ref, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n'
  import apiClient from '@/api';
  import { useAuthStore } from '@/states/auth';
  import { type SignInDto, type SignInResponseDto, type UserRole } from '@/domain/user';
  import { type UserProfile } from '@/domain/user';
  import { fetchUserProfile } from '@/api/user';
  import  {jwtDecode}  from 'jwt-decode';
  import { userStore } from '@/states/user';
  import ConfirmModal from '@/components/common/modal/ConfirmModal.vue';

  

  const authStore = useAuthStore();
  const store = userStore();
  
  const { locale } = useI18n()
  const selectedLang = ref(locale.value === 'ko' ? 'KOR' : 'ENG')
  const showModal = ref(true)
  const showErrorModal = ref(false);
  const showRegisterModal = ref(false)
  const showPasswordResetModal = ref(false)
  const router = useRouter();
  const saveId = ref<boolean>(false);
  
  interface Credentials {
    username: string;
    password: string;
  }

  interface JwtPayload{
  "sub": string,
  "role": UserRole,
  "iss": string,
  "jti": string,
  "iat": string,
  "exp": string
}


  const credentials = ref<Credentials>({
    username: '',
    password: ''
  });
  const errorMessage = ref<string>('');

  // 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
  watch(selectedLang, (newLang) =>{
    const langCode = newLang === 'KOR' ? 'ko' : 'en'
    locale.value = langCode
    localStorage.setItem('selectedLang', langCode)
  })

  function confirmModal() {
    showModal.value = false
  }

async function onSubmit(): Promise<void> {
    errorMessage.value = '';
    const payload: SignInDto = {
        userName: credentials.value.username,
        password: credentials.value.password
    };

  try {
    // 1) 로그인 → 토큰 발급
    const { data: tokens } = await apiClient.post<SignInResponseDto>('/auth/signin', payload)
    const {accessToken, refreshToken, userId} = tokens.data;
    const decoded: JwtPayload = jwtDecode(accessToken);
    const userRole = decoded.role;

    authStore.setTokens(accessToken,refreshToken);    

    // // 2) 내 프로필 조회
    const  profile  = await fetchUserProfile(userId);
    console.log("profile 응답 내용:", profile); // role이 포함되어 있는지 확인
    const userWithRole: UserProfile = {
      ...profile,
      role: userRole
    };
    authStore.setUser(userWithRole);


    store.setRole(profile.role)

    if (saveId.value) {
      localStorage.setItem('savedId', credentials.value.username);
    } else {
      localStorage.removeItem('savedId');
    }
    
    // 3) 홈으로 이동
    // router.push({ name: 'UserDashBoard' })
    
    const role = authStore.user?.role;
    if(role=='ROLE_ADMIN'){
      router.push({name: 'AdminDashBoard'})
      }else if(role=='ROLE_USER'){
          router.push({name: 'UserDashBoard'})
    }
  } catch (err: any) {
    if (err.response?.status === 500) {
      errorMessage.value =
        locale.value === 'ko'
          ? '아이디 또는 비밀번호가 올바르지 않습니다.'
          : 'Invalid username or password.'
    } 
    else if (err.response?.status === 400) {
      errorMessage.value =
        locale.value === 'ko'
          ? '아이디 또는 비밀번호를 입력해주세요'
          : 'Invalid username or password.'
    } 
    else {
      errorMessage.value =
        locale.value === 'ko'
          ? '로그인 중 오류가 발생했습니다.'
          : 'An error occurred during login.'
    }
    showErrorModal.value = true;
  }
}

    // 모달 상태를 localstorage에 넣어서 상태 관리
  onMounted(() => {
    const modalConfirmed = localStorage.getItem('modalConfirmed')
    if (modalConfirmed === 'true') {
      showModal.value = false
    }

    const savedId = localStorage.getItem('savedId');
    if (savedId) {
      credentials.value.username = savedId;
      saveId.value = true;
    }
  })
  </script>