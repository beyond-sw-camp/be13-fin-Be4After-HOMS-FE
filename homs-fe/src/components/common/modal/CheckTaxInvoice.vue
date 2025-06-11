<template>
  <div v-if="visible" class="fixed inset-0 z-120 flex items-center justify-center">
    <div class="absolute inset-0 bg-gray-900 opacity-60"></div>

    <!-- 모달 내용 -->
    <div class="relative bg-white shadow-lg w-full max-w-2/3 z-10 pb-10">
      <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-4 p-2">
        <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="$emit('confirm')">
      </div>
      <p class="m-6 text-gray-700 text-2xl font-extrabold">
        세금 명세서
      </p>
      <div class="flex justify-center">
        <img :src="Invoice" alt="세금명세서" class="flex w-2/3">
      </div>
      <div class="flex justify-end">
        <button @click="onChecked"
          class="mt-5 mr-9 px-6 py-3 w-1/6 bg-orange-600 text-white font-bold  hover:bg-orange-700 transition">
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import xmark from '@/assets/xmark.svg';
import Invoice from '@/assets/Invoice.png'
import { ref, reactive } from 'vue';


defineProps({
    visible: Boolean
})
const emit = defineEmits(['confirm'])

function onClose() {
    showModal.value = false;
}

function onChecked() {
    emit('confirm');
}



const invoiceForm = reactive({
    contury:'',
    companyName:'',
    companyNumber: '',
    ceoName:'',
    companyAdress:'',
    typeOfBusiness:'',
    industry:'',
})

const orderColumns = ref([
  { label: '월', key: 'month' },
  { label: '일', key: 'day' },
  { label: '품목', key: 'product' },
  { label: '수량', key: 'quantity' },
  { label: '단가', key: 'unitPrice' },
  { label: '공급가액', key: 'supplyPrice' },
  { label: '세액', key: 'taxPrice' },
  { label: '상태', key: 'orderStatus' },
]);

const orderList = ref([
    { month: 1, day: '23', product: 'LDEP', quantity: '100', unitPrice: '12,000', supplyPrice: '120,000', taxPrice:'12,000', orderStatus: '-'},
    { month: 1, day: '23', product: 'LLDP-C', quantity: '10', unitPrice: '2,000', supplyPrice: '20,000', taxPrice:'2,000', orderStatus: '-'},
    { month: 1, day: '23', product: 'C-PPLP', quantity: '50', unitPrice: '10,000', supplyPrice: '500,000', taxPrice:'50,000', orderStatus: '-'},
]);
  </script>