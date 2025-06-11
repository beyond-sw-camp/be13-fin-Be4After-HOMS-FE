<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- 백드롭 -->
        <div class="absolute inset-0 bg-gray-900 opacity-60"></div>

        <!-- 모달 컨테이너 -->
        <div class="relative bg-white shadow-lg w-2xl max-w-3xl text-left z-10 rounded-lg overflow-hidden">
            <!-- 헤더 -->
            <div class="flex items-center justify-between bg-slate-700 p-4">
                <h3 class="text-white text-2xl font-semibold">계약 상세 정보</h3>
                <button @click="onClose" class="text-gray-200 hover:text-white">
                    <img :src="xmark" alt="닫기" class="w-6 h-6" />
                </button>
            </div>

            <!-- 바디 -->
            <div class="p-6 space-y-4">
                <!-- 로딩 표시 -->
                <div v-if="loading" class="text-center text-gray-500 py-8">로딩 중...</div>

                <!-- 상세 정보 -->
                <dl v-else-if="detail" class="grid grid-cols-1 gap-y-3">
                    <div class="flex">
                        <dt class="w-32 font-medium text-gray-700">파트너사:</dt>
                        <dd class="flex-1 text-gray-800">{{ detail.companyName }}</dd>
                    </div>
                    <div class="flex">
                        <dt class="w-32 font-medium text-gray-700">대표담당자:</dt>
                        <dd class="flex-1 text-gray-800">{{ detail.representManagerName }}</dd>
                    </div>
                    <div class="flex">
                        <dt class="w-32 font-medium text-gray-700">제품명:</dt>
                        <dd class="flex-1 text-gray-800">{{ detail.productName }}</dd>
                    </div>
                    <div class="flex">
                        <dt class="w-32 font-medium text-gray-700">분류:</dt>
                        <dd class="flex-1 text-gray-800">{{ detail.categoryName }}</dd>
                    </div>
                    <div class="flex">
                        <dt class="w-32 font-medium text-gray-700">계약시작일자:</dt>
                        <dd class="flex-1 text-gray-800">{{ formatDate(detail.contractStartAt) }}</dd>
                    </div>
                    <div class="flex">
                        <dt class="w-32 font-medium text-gray-700">계약만료일자:</dt>
                        <dd class="flex-1 text-gray-800">{{ formatDate(detail.contractStopAt) }}</dd>
                    </div>
                </dl>

                <!-- 에러 표시 -->
                <div v-else class="text-center text-red-500 py-8">계약 정보를 불러올 수 없습니다.</div>
            </div>

            <!-- 푸터 -->
            <div class="flex justify-end p-4 bg-gray-50">
                <button @click="onClose" class="px-6 py-2 bg-slate-500 text-white font-bold hover:bg-slate-600 transition rounded-md">닫기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, watch} from "vue";
import xmark from "@/assets/xmark.svg";
import apiClient from "@/api";

// Props
const props = defineProps({
    visible: {type: Boolean, required: true},
    contractId: {type: [Number, String], required: true},
});
const emit = defineEmits(["close"]);

// 상태
const detail = ref(null);
const loading = ref(false);

// 모달 닫기 핸들러
function onClose() {
    emit("close");
}

// 날짜 포맷
const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString();
};

// visible이 true로 변경될 때마다 상세 조회
watch(
    () => props.visible,
    async (visible) => {
        if (visible) {
            loading.value = true;
            try {
                const response = await apiClient.get(`/contract/${props.contractId}`);
                detail.value = response.data.data;
            } catch (err) {
                console.error("계약 상세 조회 실패:", err);
                detail.value = null;
            } finally {
                loading.value = false;
            }
        } else {
            detail.value = null;
        }
    },
    {immediate: true}
);
</script>
