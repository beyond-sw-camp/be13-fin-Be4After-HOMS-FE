<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />

        <div class="p-6 bg-white rounded-md shadow-md">
            <div class="flex items-center justify-between">
                <h1 class="text-3xl font-bold mb-4">{{ notice.title }}</h1>
                <p class="text-gray-500 text-sm">{{ new Date(notice.createdAt).toLocaleDateString() }}</p>
            </div>
            <hr class="my-2" />
            <div v-if="imageUrl" class="mt-6">
                <img :src="imageUrl" alt="Notice Image" class="max-w-full rounded-md" />
            </div>
            <p class="text-gray-700">{{ notice.content }}</p>
            <hr class="my-6" />
            <div class="flex items-center justify-end">
                <div v-if="authStore.isAdmin">
                    <button @click="goToEditPage(notice)" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">
                        {{ $t("btn.edit") }}
                    </button>
                    <button @click="confirmDelete(notice.id)" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">
                        {{ $t("btn.del") }}
                    </button>
                </div>
                <button @click="goBack" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
                    {{ $t("btn.list") }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import apiClient from "@/api";
import {ref, watch, onMounted, onBeforeUnmount} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";
import {loadAndCreateImageURL, revokeImageURL} from "@/utils/imageView";
import Breadcrumb from "@/components/common/Breadcrumb.vue";

const authStore = useAuthStore();

const route = useRoute(); // 현재 URL 정보 가져옴
const router = useRouter(); // 경로 이동 (라우트를 이동하거나 상태 변경할때 사용)
const noticeId = Number(route.params.id); // 경로에 포함된 번호를 가져옴
const notice = ref({});
const {t, locale} = useI18n();
const selectedLang = ref(locale.value === "ko" ? "KOR" : "ENG");

// 이미지 관련
const imageUrl = ref("");

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) => {
    const langCode = newLang === "KOR" ? "ko" : "en";
    locale.value = langCode;
    localStorage.setItem("selectedLang", langCode);
});

const goBack = () => {
    router.push("/notices");
};

// 데이터 가져오는 함수
const fetchData = async () => {
    try {
        const response = await apiClient.get(`/notice/${noticeId}`);
        if (response.status === 200) {
            notice.value = response.data.data; // 응답 데이터 할당
            // s3Image 키가 존재하면 이미지 로드 함수 호출
            if (notice.value.imagePath) {
                loadImageAndHandleMemory(notice.value.imagePath);
            } else {
                loadImageAndHandleMemory(null); // s3Image가 없으면 이미지 초기화
            }
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
        loadImageAndHandleMemory(null); // 파일 데이터가 없으면 이미지도 초기화
    }
};

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(() => {
    fetchData();
});

const goToEditPage = (notice) => {
    router.push({
        name: "AdminNoticesFrom",
        query: {noticesId: notice.id},
    });
};

const confirmDelete = (noticeId) => {
    if (confirm(t("script.delete"))) {
        // 삭제 처리 로직 호출
        deletePostData(noticeId);
    }
};

// 게시글 삭제
const deletePostData = async (noticeId) => {
    try {
        // 이미지가 있다면 먼저 제거
        if (notice.value.imagePath) {
            const response = await apiClient.delete(`/files/delete?key=${notice.value.imagePath}`);
            console.log(response.data);
        }

        await apiClient.delete(`/notice/${noticeId}`);
        router.push("/notices/");
    } catch (error) {
        alert(error.response.data.message);
    }
};

// --- 이미지 로드 및 메모리 관리 로직 시작 ---
const loadImageAndHandleMemory = async (s3Key) => {
    // 기존 이미지 URL이 있다면 먼저 해제
    if (imageUrl.value) {
        revokeImageURL(imageUrl.value);
        imageUrl.value = null; // 해제 후 null로 설정
    }

    if (s3Key) {
        imageUrl.value = await loadAndCreateImageURL(apiClient, s3Key);
    }
};

// 모달이 닫히거나 컴포넌트가 언마운트될 때 이미지 URL 해제
onBeforeUnmount(() => {
    if (imageUrl.value) {
        revokeImageURL(imageUrl.value);
    }
});
// --- 이미지 로드 및 메모리 관리 로직 끝 ---
</script>
