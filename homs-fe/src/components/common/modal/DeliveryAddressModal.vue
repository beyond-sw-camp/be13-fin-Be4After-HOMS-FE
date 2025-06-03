<template>
  <div v-if="visible" class="overlay">
    <div class="backdrop"></div>

    <div class="container">
      <div class="custom-header">
        <img :src="xmark" alt="닫기" class="close-icon" @click="$emit('cancel')" />
      </div>

      <p class="title">{{ modalTitle }}</p>

      <div class="form-wrapper">
        <div class="form-group">
          <label>배송지명</label>
          <input type="text" v-model="form.deliveryName" />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label>우편번호</label>
            <input type="text" v-model="form.postalCode" disabled />
          </div>
          <button class="btn-postalCode" :buttons="actionButtons" @click="findZipcode">우편번호 찾기</button>
        </div>

        <div class="form-group">
          <label>도로명주소</label>
          <input type="text" v-model="form.streetAddress" />
        </div>

        <div class="form-group">
          <label>상세주소</label>
          <input type="text" v-model="form.detailedAddress" />
        </div>

        <div class="form-group">
          <label>참고항목</label>
          <input type="text" v-model="form.reference" />
        </div>
      </div>

      <div class="footer">
        <button @click="onClick" class="btn-confirm">저장</button>
        <button @click="$emit('cancel')" class="btn-cancel">취소</button>
      </div>
    </div>
  </div>

</template>

<script setup>
import xmark from '@/assets/xmark.svg';
import { reactive, computed, watch, ref } from 'vue';
import apiClient from "@/api";

const props = defineProps({
  visible: Boolean,
  data: Object,
  selectedCompanyId: Number
});

// 동적 타이틀
const modalTitle = computed(() => (props.data ? '배송지 수정' : '배송지 추가'));

const onClick = async () => {
  const newData = {
    deliveryName: form.deliveryName,
    postalCode: form.postalCode,
    streetAddress: form.streetAddress,
    detailedAddress: form.detailedAddress,
    reference: form.reference,
    companyId: props.selectedCompanyId
  };

  console.log(newData);
  console.log(props.selectedCompanyId);

  try {
    let res;

    if (props.data) {
      // 배송지 수정
      res = await apiClient.put(`/deliveryAdd/update/${props.data.addressId}`, newData);
      if (res.status === 200 || res.status === 201) {
        console.log("배송지 수정 성공");
        emit('confirm');
      }
    } else {
      // 배송지 추가
      res = await apiClient.post("/deliveryAdd/create", newData);
      if (res.status === 200 || res.status === 201) {
        console.log("배송지 추가 성공");
        emit('confirm');
      }
    }
  } catch (error) {
    console.error('API 실패:', error);
    alert(error?.response?.data?.message || '작업 중 오류가 발생했습니다.');
  }
};

// confirm라는 이벤트를 외부로 보낼 수 있게 정의
const emit = defineEmits(['confirm', 'cancel']);

const form = reactive({
  deliveryName: '',    // 배송지명
  postalCode: '',      // 우편번호
  streetAddress: '',   // 도로명주소
  detailedAddress: '', // 상세주소
  reference: ''        // 참고항목
});

// 전달받은 data로 form 초기화
watch( () => props.data,
  (newData) => {
    if (newData) {
      // 새로 추가일 경우 우편번호, 도로명주소만 Binding
      form.deliveryName = newData.deliveryName;
      form.postalCode = newData.postalCode;
      form.streetAddress = newData.streetAddress;
      form.detailedAddress = newData.detailedAddress;
      form.reference = newData.reference;
    } else {
      form.deliveryName = '';
      form.postalCode = '';
      form.streetAddress = '';
      form.detailedAddress = '';
      form.reference = '';
    }
  },
  { immediate: true }
);

function findZipcode() {
  if (!window.daum || !window.daum.Postcode) {
    alert('다음 주소 검색 스크립트가 로드되지 않았습니다.')
    return
  }

  new window.daum.Postcode({
    oncomplete(data) {
      form.deliveryName = data.sigungu
      form.postalCode = data.zonecode
      form.streetAddress = data.roadAddress
      form.detailedAddress = ''
      form.reference = ''
    }
  }).open()
}
</script>

<!-- 다음 주소 검색 스크립트 로드 -->
<script>
if (typeof window !== 'undefined' && !window.daum) {
  const script = document.createElement('script')
  script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
  script.async = true
  document.head.appendChild(script)
}
</script>

<style scoped>
.custom-header {
  display: flex;
  justify-content: flex-end;
  background-color: #334155;
  padding: 0.5rem;
}

.close-icon {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  display: flex;
  align-items: center;
  justify-content: center;
}

.backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(17, 24, 39, 0.6);
}

.container {
  position: relative;
  background-color: white;
  width: 100%;
  max-width: 450px;
  z-index: 10;
  border-radius: 10px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 0 1.5rem 2rem;
}

/* 상단 바 */
.top-bar {
  background-color: #334155;
  height: 36px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 0.75rem;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

/* 제목 */
.title {
  margin: 1.5rem 0 1rem;
  color: #374151;
  font-size: 1.5rem;
  font-weight: 800;
}

/* 폼 */
.form-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.form-row {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.form-row .half {
  flex: 1;
}

.btn-postalCode {
  height: 36px;
  padding: 0 1rem;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}

.btn-postalCode:hover {
  background-color: #4b5563;
}

/* 하단 버튼 */
.footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-confirm,
.btn-cancel {
  padding: 0.6rem 1.5rem;
  font-weight: bold;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  width: 80px;
}

.btn-confirm {
  background-color: #ea580c;
  color: white;
}

.btn-confirm:hover {
  background-color: #c2410c;
}

.btn-cancel {
  background-color: #6b7280;
  color: white;
}

.btn-cancel:hover {
  background-color: #4b5563;
}
</style>