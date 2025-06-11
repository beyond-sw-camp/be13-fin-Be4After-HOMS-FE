<template>
    <div class="w-full max-w-1/2 p-4 bg-white border border-gray-300 rounded-3xl shadow-lg sm:p-8">
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900">정산 관리</h5>
            <a href="#" class="text-sm font-medium hover:underline" @click.prevent="goToSettlementPage">+</a>
        </div>

        <div class="flow-root">
            <ul role="list" class="divide-y divide-gray-200">
                <!-- 헤더 -->
                <li class="py-3 sm:py-4">
                    <div class="flex w-full justify-around">
                        <p class="w-1/4 text-base font-bold text-gray-900 text-center truncate">주문 번호</p>
                        <p class="w-1/4 text-base font-bold text-gray-900 text-center truncate">주문 일자</p>
                        <p class="w-1/4 text-base font-bold text-gray-900 text-center truncate">정산 일자</p>
                        <p class="w-1/4 text-base font-bold text-gray-900 text-center truncate">정산 여부</p>
                    </div>
                </li>

                <!-- 데이터 목록 -->
                <li v-for="(settlements, index) in settlementsList" :key="index" class="py-3 sm:py-4">
                    <div class="flex items-center w-full justify-between">
                        <p class="w-1/5 text-base font-bold text-center text-gray-900 truncate">{{ settlements.orderId
                        }}</p>
                        <p class="w-1/5 text-base font-bold text-center text-gray-900 truncate">{{ settlements.orderDate
                        }}</p>
                        <p class="w-1/5 text-base font-bold text-center text-gray-900 truncate">{{
                            settlements.settlementDate }}</p>
                        <p class="w-1/5 text-base font-bold text-center truncate" :class="getColor(settlements.status)">
                            {{ settlements.status }}
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import apiClient from "@/api";
import {userStore} from "@/states/user";
import {useAuthStore} from "@/states/auth";
import {storeToRefs} from "pinia";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";

const store = userStore();
const authstore = useAuthStore();
const {userId} = storeToRefs(store);
const router = useRouter();

const settlementsList = ref([]);

const goToSettlementPage = () => {
    router.push("/settlements"); // 유저 전용 정산 페이지 경로
};

const fetchData = async () => {
    const response = await apiClient.get(`settlement/user/${authstore.user.userId}`);
    const data = response.data.data;
    console.log("대시보드 정산 관리 데이터:", data);
    settlementsList.value = data.map((item, index) => ({
        orderId: item.orderCode,
        orderDate: new Date(item.orderDate).toISOString().split("T")[0],
        settlementDate: new Date(item.settlementDate).toISOString().split("T")[0],
        status: mapSettlementStatus(item.isSettled),
    }));
};

const getColor = (status) => {
    switch (status) {
        case "완료":
            return "text-green-700";
        case "미정산":
            return "text-red-600";
        case "대기":
            return "text-yellow-400";
        default:
            return "text-gray-900";
    }
};

const mapSettlementStatus = (status) => {
    switch (status) {
        case "SETTLED":
            return "완료";
        case "UNSETTLED":
            return "미정산";
        case "WAITING":
            return "대기";
        default:
            return "알 수 없음"; // 예외 처리
    }
};

onMounted(() => {
    fetchData();
});
</script>
