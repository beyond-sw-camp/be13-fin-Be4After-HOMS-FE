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
import { useRoute } from 'vue-router';
import ClientDetailFields from '@/components/common/ClientDetailFields.vue';
import apiClient from '@/api';
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const isEditable = ref(false);
const route = useRoute();
const clientId = route.params.id;

const fields = ref([
  { label: '파트너사명', key: 'companyName', value: '' },
  { label: '대표자명', key: 'representName', value: '' },
  { label: '사업자번호', key: 'registrationNumber', value: '' },
  { label: '주소', key: 'companyAddress', value: '' },
  { label: '연락처', key: 'representCall', value: '' },
  { label: '이메일', key: 'representManagerEmail', value: '' },

]);

const originalData = ref({}); 

const countryEnumMap = {
  1: 'KOREA',
  2: 'USA'
};

const fetchData = async () => {
    const response = await apiClient.get(`admin/company/${clientId}`)
    const data = response.data.data;
    originalData.value = data;

    console.log('서버 응답 country:', data.registrationNumber); // ← 실제 응답값 확인
    console.log('originalData:', originalData.value); // ← 전체 데이터 확인

    const mapping = {
        country: data.countryId,
        companyName: data.companyName,
        representName: data.representName,
        registrationNumber: data.registrationNumber,
        companyAddress: data.companyAddress,
        representCall: data.representCall,
        representManagerEmail: data.representManagerEmail,

    };

    fields.value.forEach(field => {
        field.value = mapping[field.key];
    });
}


const toggleEdit = async () => {
  if (isEditable.value) {
    const updatedData = {};
    fields.value.forEach(field => {
        updatedData[field.key] = field.value;
    });

    const countryEnumValue = countryEnumMap[originalData.value.countryId];

    console.log('저장할 데이터:', fields.value.map(f => ({ [f.label]: f.value })));
    try {
       await apiClient.put(`/admin/company/${clientId}`, {
        country: countryEnumValue,
        companyName: updatedData.companyName,
        registrationNumber: updatedData.registrationNumber,
        representName: updatedData.representName,
        representCall: updatedData.representCall,
        representPhone: originalData.value.representPhone, // 수정 X
        representManagerName: originalData.value.representManagerName, // 수정 X
        representManagerEmail: updatedData.representManagerEmail,
        continueStatus: originalData.value.continueStatus,
        approveStatus: originalData.value.approveStatus
      });

      alert('수정이 완료되었습니다.');
    } catch (error) {
      console.error('수정 중 오류 발생:', error);
      alert('수정에 실패했습니다.');
      return; 
    }
  }


  isEditable.value = !isEditable.value;
};

const goBack = () => {
    window.history.back()
}

onMounted(() =>{
    fetchData();
    
}) 
</script>

<style scoped>
input[readonly] {
  background-color: transparent;
  cursor: default;
}
</style>