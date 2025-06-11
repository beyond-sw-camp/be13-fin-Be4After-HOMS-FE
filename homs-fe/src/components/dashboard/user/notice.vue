<template>
    <div class="w-1/3 max-w-md p-4 bg-white border border-gray-300 rounded-3xl shadow-lg sm:p-8">
        <!-- 카드 헤더 -->
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900">공지 사항</h5>
            <a href="#" class="text-sm font-medium hover:underline" @click.prevent="goToNotice"> + </a>
        </div>
        <!-- 카드 내용 부분 -->
        <div class="flow-root">
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="(item, index) in NoticeList" :key="index" class="py-3 sm:py-4">
                    <div class="flex items-center justify-between">
                        <p class="flex text-md font-medium text-gray-900 w-2/3 pr-4 truncate whitespace-nowrap overflow-hidden text-ellipsis">{{ item.title }}</p>

                        <div class="flex w-1/3 justify-end items-center text-gray-900">{{ item.date }}</div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import apiClient from "@/api";
import {useAuthStore} from "@/states/auth";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
useAuthStore;

const router = useRouter();

// 나중에 DB에서 받아서 할 예정
const NoticeList = ref([]);

const goToNotice = () => {
    router.push("/notices"); // 유저 전용 정산 페이지 경로
};

const fetchData = async () => {
    const authStore = useAuthStore();
    console.log("fetchData 진입 - accessToken:", authStore.accessToken);
    console.log(authStore.user);

    try {
        const response = await apiClient("notice/");
        const data = response.data.data;
        console.log("대시보드 공지사항 조회", data);
        NoticeList.value = data.content.map((item, index) => ({
            title: item.title,
            date: item.createdAt.split("T")[0],
        }));
    } catch (err) {
        console.error("공지사항 요청 실패", err.response?.status);
    }
};

onMounted(() => {
    fetchData();
});
</script>
