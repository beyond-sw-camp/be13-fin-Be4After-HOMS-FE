<template>
  <div>
    <Breadcrumb />
    <ClientDetailFields :fields="fields" :isEditable="isEditable" />

    <div class="flex justify-center w-2/3 m-auto my-4 gap-10">
      <button @click="toggleEdit" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
        {{ isEditable ? '저장' : '수정' }}
      </button>
      <button @click="goBack" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
        취소
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/states/auth';
import { useRoute } from 'vue-router';
import ClientDetailFields from '@/components/common/ClientDetailFields.vue';
import apiClient from '@/api';
import Breadcrumb from '@/components/common/Breadcrumb.vue';


const route = useRoute();
const isEditable = ref(false);
const authStore = useAuthStore();

const fields = ref([
  { label: '이름', key: 'managerName', value: '' },
  { label: '거래처명', key: 'companyName', value: '' },
  { label: '담당', key: 'deptName', value: '' },
  { label: '아이디', key: 'userName', value: '' },
  { label: '비밀번호', key: 'password', value: '' },
  { label: '이메일', key: 'managerEmail', value: '' },
  { label: '전화번호', key: 'managerPhone', value: '' },
]);


const userData = async (userId) => {
  try {
    const response = await apiClient.get(getApiPath(`/user/${userId}`));
    const data = response.data.data;

    const deptNameMap = {
      SALES: '영업',
      BUY: '구매',
      DELIVERY: '배송',
      MATERIALS: '자재'
    };

    fields.value = fields.value.map(field => {
      let value = data[field.key] ?? '';
      if (field.key === 'deptName') {
        value = deptNameMap[value] || value; // 매핑된 값이 없으면 원래 값 유지
      }
      return {
        ...field,
        value,
      };
    });
  } catch (error) {
    console.error('유저 정보 조회 실패:', error);
  }
};

const getApiPath = (basePath) => {
      return authStore.isAdmin ? `/admin${basePath}` : basePath;
    }


const toggleEdit = async () => {
  if (isEditable.value) {
    const updatedData = {};
    fields.value.forEach(field => {
      updatedData[field.key] = field.value;
    });

    // 로컬스토리지에서 userId 가져오기
    const userId = route.params.id;


    try{
      await apiClient.put(getApiPath(`/user/${userId}`), {
        managerName: updatedData.managerName,
        managerEmail: updatedData.managerEmail,
        managerPhone: updatedData.managerPhone,
        newPassword: updatedData.password,
      });
      alert('수정이 완료되었습니다.');
    }catch (error) {
      console.error('수정 중 오류 발생:', error);
      return; 
    }
  }

  isEditable.value = !isEditable.value;
};



const goBack = () => {
    window.history.back()
}

onMounted( () =>{
    const userId = route.params.id;
    if (userId) {
        userData(userId);
    } else {
        console.error("유저 ID 없음!");
    }
})


</script>