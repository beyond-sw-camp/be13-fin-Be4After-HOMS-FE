<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-gray-900 opacity-60"></div>

    <div class="relative w-full max-w-md rounded-lg bg-white shadow-xl overflow-hidden z-10">
      <div class="flex justify-end bg-slate-700 p-2">
        <img :src="xmark" alt="닫기" class="w-5 h-5 cursor-pointer" @click="$emit('cancel')" />
      </div>

      <div class="p-6">
        <p class="text-2xl font-extrabold text-gray-800 mb-4">배송지 상세 정보</p>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col">
            <label class="mb-1 font-semibold text-gray-700">거래처명</label>
            <input type="text" v-model="form.companyName" disabled
              class="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div class="flex flex-col">
            <label class="mb-1 font-semibold text-gray-700">배송지명</label>
            <input type="text" v-model="form.deliveryName" disabled
              class="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div class="flex items-end gap-2">
            <div class="flex-1 flex flex-col">
              <label class="mb-1 font-semibold text-gray-700">우편번호</label>
              <input type="text" v-model="form.postalCode" disabled
                class="p-2 border border-gray-300 rounded-md bg-gray-100 text-sm" />
            </div>
          </div>

          <div class="flex flex-col">
            <label class="mb-1 font-semibold text-gray-700">도로명주소</label>
            <input type="text" v-model="form.streetAddress" disabled
              class="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div class="flex flex-col">
            <label class="mb-1 font-semibold text-gray-700">상세주소</label>
            <input type="text" v-model="form.detailedAddress" disabled
              class="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div class="flex flex-col">
            <label class="mb-1 font-semibold text-gray-700">참고항목</label>
            <input type="text" v-model="form.reference" disabled
              class="p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-8">
          <button @click="$emit('cancel')"
            class="w-20 py-2 bg-gray-600 text-white font-bold rounded-md hover:bg-gray-700 transition-colors">
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import xmark from '@/assets/xmark.svg';
import { reactive, watch} from 'vue';

const props = defineProps({
  visible: Boolean,
  data: Object,
});

const form = reactive({
  deliveryName: '',    // 배송지명
  postalCode: '',      // 우편번호
  streetAddress: '',   // 도로명주소
  detailedAddress: '', // 상세주소
  reference: '',       // 참고항목
  companyName: ''      // 회사명 
});

// 전달받은 data로 form 초기화
watch(() => props.visible, (newVisible) => {
  if (newVisible) { // 모달이 열릴 때
    if (props.data) { // 수정 모드: 전달받은 데이터로 폼 채우기
      form.deliveryName = props.data.deliveryName;
      form.postalCode = props.data.postalCode;
      form.streetAddress = props.data.streetAddress;
      form.detailedAddress = props.data.detailedAddress;
      form.reference = props.data.reference;
      form.companyName = props.data.companyName;
    } else { // 추가 모드: 폼 초기화
      form.deliveryName = '';
      form.postalCode = '';
      form.streetAddress = '';
      form.detailedAddress = '';
      form.reference = '';
      form.companyName = '';
    }
  } else { // 모달이 닫힐 때: 폼을 한 번 더 초기화하여 다음 오픈 시 깨끗하게
      form.deliveryName = '';
      form.postalCode = '';
      form.streetAddress = '';
      form.detailedAddress = '';
      form.reference = '';
      form.companyName = '';
  }
}, { immediate: true });

// confirm라는 이벤트를 외부로 보낼 수 있게 정의
const emit = defineEmits(['confirm', 'cancel']);

</script>