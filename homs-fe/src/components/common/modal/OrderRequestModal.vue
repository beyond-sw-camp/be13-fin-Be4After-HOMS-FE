<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-gray-900 opacity-60"></div>

    <div class="relative bg-white shadow-lg w-full max-w-md text-center z-10 pb-5">
      <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-4 p-2">
        <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="handleCancel">
      </div>
      <!-- 본문 -->
      <div class="flex justify-center">
        <p class=" p-3 text-gray-700 font-bold text-lg" v-html="text"></p>
      </div>
      <div class="flex flexrow justify-center gap-5 pt-3">
        <!-- 납품위치 (수정) -->
        <div class="flex flex-col gap-1 w-full md:w-auto">
          <label class="block text-gray-700 font-semibold">납품위치</label>
          <select v-model="selectedDelivery"
            class="select-box aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-4 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
            <option disabled value="">선택</option>
            <option v-for="option in deliveryOptions" :key="option.value" :value="option.value">{{
              option.label }}</option>
          </select>
        </div>
        <!-- 납기일 (수정) -->
        <div class="flex flex-col gap-1 w-full md:w-auto">
          <label for="dueDateInput" class="block text-gray-700 font-semibold">납기일</label>
          <input type="date" id="dueDateInput" v-model="selectedDueDate"
            class="w-fit outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 px-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
        </div>
      </div>

      <!-- 버튼들 -->
      <div class="pt-5">
        <button @click="handleConfirm"
          class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2 cursor-pointer">확인</button>
        <button @click="handleCancel"
          class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm cursor-pointer">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import xmark from '@/assets/xmark.svg'
import apiClient from '@/api';

const props = defineProps({
  visible: Boolean,
  text: {
    type: String,
    default: '임의의 텍스트',
  },
  deliveryOptions: {
    type: Array,
    default: () => [{ value: '서울', label: '서울' }],
  },
  orderId: {
    type: Number,
    required: true
  }
})

// textarea의 내부 상태 관리
// const internalInputValue = ref(props.initialInputValue);
const selectedDelivery = ref("");
const selectedDueDate = ref("");

// watch(() => props.initialInputValue, (newValue) => {
//   internalInputValue.value = newValue;
// });

// 부모에게 보낼 값
const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// 확인 버튼을 누르면 동작
const handleConfirm = () => {
  // onConfirm prop으로 받은 함수를 호출합니다.
  const dueDate = `${selectedDueDate.value}T00:00:00`;

  const now = new Date(); 
  const isoDate = now.toISOString(); 

  const taxInvoice = `taxInvoice${props.orderId}`;

  const payload = {
    orderId: props.orderId,
    settlementDate: isoDate,
    texInvoice: taxInvoice,
    isSettled: "UNSETTLED",
    };

  emit('confirm', selectedDelivery.value, dueDate);
  emit('update:visible', false); // 모달 닫기
  console.log("orderRequst에서의 orderId",props.orderId)

  const response = apiClient.post(`settlement/${props.orderId}`,payload)
  console.log("settlementDate", payload.settlementDate)
  console.log("payload", payload)
  console.log('정산 요청 성공:', response.data);
  
}

// 취소 버튼 (및 X 마크)을 누르면 모달 닫고 초기화
const handleCancel = () => {
  emit('update:visible', false);
  selectedDelivery.value = "";
  selectedDueDate.value = "";
}
</script>