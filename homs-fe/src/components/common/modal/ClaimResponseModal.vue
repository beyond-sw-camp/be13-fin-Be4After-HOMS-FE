<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-gray-900 opacity-60"></div>
        <div class="relative bg-white shadow-lg w-2xl max-w-5xl text-left z-10 pb-5">
            <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-4 p-2">
                <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="handleCancel" />
            </div>
            <div class="flex flex-col px-8 pt-5">
                <div class="flex justify-between mb-5 pl-4.5 pr-4.5">
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
                                <p v-if="claimData.status === 'EXCHANGE'">반품</p>
                                <p v-else-if="claimData.status === 'COMPLETE'">완료</p>
                                <p v-else>취소</p>
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
                                <p v-if="claimData.reason == 'DEFECTIVE'">제품 불량</p>
                                <p v-else-if="claimData.reason == 'DAMAGE'">제품 파손</p>
                                <p v-else-if="claimData.reason == 'DISSATISFIED'">품질 불만족</p>
                                <p v-else>기타</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-5 px-4">
                    <label class="block text-gray-700 font-semibold mb-1">상세 사유</label>
                    <div class="border border-gray-300 rounded-md py-2 px-3 text-gray-800">{{ claimData.details }}</div>
                </div>
            </div>

            <div v-if="authStore.isAdmin && claimData.status === 'EXCHANGE'" class="pt-3 flex justify-center">
                <button @click="handleConfirm(claimData.claimId)"
                    class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2 cursor-pointer">승인</button>
                <button @click="handleCancel"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm cursor-pointer">취소</button>
            </div>
            <div v-else class="pt-3 flex justify-center">
                <button @click="handleCancel"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm cursor-pointer">확인</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import xmark from "@/assets/xmark.svg";
import {useAuthStore} from "@/states/auth";

const authStore = useAuthStore();

const props = defineProps({
    visible: Boolean,
    claimData: Object,
});

// 부모에게 보낼 값
const emit = defineEmits(["update:visible", "confirm", "cancel"]);

// 확인 버튼을 누르면 동작
const handleConfirm = (claimId) => {
    // onConfirm prop으로 받은 함수를 호출합니다.
    emit("confirm", claimId);
    console.log(claimId);
    emit("update:visible", false); // 모달 닫기
};

// 취소 버튼 (및 X 마크)을 누르면 모달 닫고 초기화
const handleCancel = () => {
    emit("update:visible", false);
};
</script>
