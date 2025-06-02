<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-gray-900 opacity-60"></div>
        <div class="relative bg-white shadow-lg w-2xl max-w-5xl text-left z-10 pb-10">
            <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-4 p-2">
                <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="handleCancel" />
            </div>
            <div class="flex flex-col px-8">
                <div class="flex justify-between mb-5">
                    <div class="w-1/2 pr-4">
                        <div class="flex items-center mb-2">
                            <label class="w-24 text-gray-700 font-semibold mr-2">주문번호</label>
                            <div class="flex-1 border border-gray-300 rounded-md py-2 px-3 text-gray-800">
                                {{ claimData.orderCode }}
                            </div>
                        </div>
                        <div class="flex items-center mb-2">
                            <label class="w-24 text-gray-700 font-semibold mr-2">거래처</label>
                            <div class="flex-1 border border-gray-300 rounded-md py-2 px-3 text-gray-800">
                                {{ claimData.companyName }}
                            </div>
                        </div>
                        <div class="flex items-center mb-2">
                            <label class="w-24 text-gray-700 font-semibold mr-2">상태</label>
                            <div class="flex-1 border border-gray-300 rounded-md py-2 px-3 text-gray-800">
                                {{ claimData.status }}
                            </div>
                        </div>
                    </div>

                    <div class="w-1/2 pl-4">
                        <div class="flex items-center mb-2">
                            <label class="w-24 text-gray-700 font-semibold mr-2">품목명</label>
                            <div class="flex-1 border border-gray-300 rounded-md py-2 px-3 text-gray-800">
                                {{ claimData.productName }}
                            </div>
                        </div>
                        <div class="flex items-center mb-2">
                            <label class="w-24 text-gray-700 font-semibold mr-2">주문수량</label>
                            <div class="flex-1 border border-gray-300 rounded-md py-2 px-3 text-gray-800">
                                {{ claimData.quantity }}
                            </div>
                        </div>
                        <div class="flex items-center mb-2">
                            <label class="w-24 text-gray-700 font-semibold mr-2">사유</label>
                            <div class="flex-1 border border-gray-300 rounded-md py-2 px-3 text-gray-800">
                                {{ claimData.reason }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-5 px-4">
                    <label class="block text-gray-700 font-semibold mb-1">상세 사유</label>
                    <div class="border border-gray-300 rounded-md py-2 px-3 text-gray-800">{{ claimData.details }}</div>
                </div>
            </div>

            <div class="pt-5 flex justify-center">
                <button @click="handleConfirm" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2 cursor-pointer">확인</button>
                <button @click="handleCancel" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm cursor-pointer">취소</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from "vue";
import xmark from "@/assets/xmark.svg";

const props = defineProps({
    visible: Boolean,
    claimData: Object,
});

// textarea의 내부 상태 관리
const selectedOption = ref("");
const inputValue = ref(props.inputValue);

// 부모에게 보낼 값
const emit = defineEmits(["update:visible", "confirm", "cancel"]);

// 확인 버튼을 누르면 동작
const handleConfirm = () => {
    // onConfirm prop으로 받은 함수를 호출합니다.
    emit("confirm", selectedOption.value, inputValue.value);
    emit("update:visible", false); // 모달 닫기
};

// 취소 버튼 (및 X 마크)을 누르면 모달 닫고 초기화
const handleCancel = () => {
    emit("update:visible", false);
    selectedOption.value = "";
    inputValue.value = "";
};
</script>
