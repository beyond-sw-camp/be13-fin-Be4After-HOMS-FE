<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />
        <div class="p-6 bg-white rounded-md shadow-md">
            <h4 class="text-xl font-bold mb-4">{{ isEditMode ? $t("btn.edit") : $t("btn.create") }}</h4>
            <form @submit.prevent="submitForm">
                <!-- 제목 -->
                <div class="mb-4">
                    <label for="title" class="block text-sm font-medium text-gray-700">{{ $t("data.title") }}</label>
                    <input type="text" id="title" :placeholder="$t('placeholder.title_input')" v-model="title"
                        class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                </div>
                <!-- 내용 -->
                <div class="mb-4 my-4">
                    <label for="content" class="block text-sm font-medium text-gray-700">{{ $t("data.content")
                        }}</label>
                    <textarea id="content" :placeholder="$t('placeholder.content_input')" v-model="content"
                        class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 h-[25rem]"></textarea>
                </div>
                <!-- 이미지 업로드 -->
                <div class="mb-4">
                    <label for="image" class="block text-sm font-medium text-gray-700">이미지 업로드</label>
                    <input type="file" id="image" @change="handleImageChange" accept="image/*"
                        class="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    <div v-if="imageUrl" class="mt-2">
                        <img :src="imageUrl" alt="Uploaded Image" class="max-h-48 rounded-md" />
                    </div>
                    <!-- 업로드 진행바 -->
                    <div v-if="uploadProgress > 0" class="mt-2">
                        {{ $t("message.uploading") }}: {{ uploadProgress }}%
                        <progress :value="uploadProgress" max="100" class="w-full"></progress>
                    </div>
                    <!-- 업로드 실패 메세지 -->
                    <div v-if="uploadError" class="mt-2 text-red-500">{{ $t("message.upload_failed") }}: {{
                        uploadErrorMessage }}</div>
                </div>
                <!-- 하단 버튼 -->
                <div class="flex items-center justify-end">
                    <button type="submit"
                        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">
                        {{ isEditMode ? $t("btn.edit") : $t("btn.save") }}
                    </button>
                    <button type="button" @click="goBack"
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
                        {{ $t("btn.cancel") }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import apiClient from "@/api";
import {ref, watch, onMounted, onBeforeUnmount} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";
import {loadAndCreateImageURL, revokeImageURL} from "@/utils/imageView";
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const authStore = useAuthStore();

const {t, locale} = useI18n();
const selectedLang = ref(locale.value === "ko" ? "KOR" : "ENG");

const route = useRoute();
const router = useRouter();

const noticesId = Number(route.query.noticesId || "");
const notice = ref({});
const title = ref("");
const content = ref("");
const isEditMode = ref(route.query.noticesId);

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) => {
    const langCode = newLang === "KOR" ? "ko" : "en";
    locale.value = langCode;
    localStorage.setItem("selectedLang", langCode);
});

// 이미지 업로드 관련 상태
const selectedImage = ref(null);
const imageUrl = ref("");
const uploadProgress = ref(0);
const uploadError = ref(false);
const uploadErrorMessage = ref("");

// 이미지 미리보기
const handleImageChange = (event) => {
    const file = event.target.files[0];
    selectedImage.value = file;
    if (file) {
        imageUrl.value = URL.createObjectURL(file); // 미리보기 URL 생성
    } else {
        imageUrl.value = "";
    }
};

// 저장
const submitForm = async () => {
    const params = {
        title: title.value,
        content: content.value,
    };

    // 이미지 업로드
    try {
        if (selectedImage.value) {
            // 만약에 수정모드면 원본 이미지 제거
            if (isEditMode.value) {
                const response = await apiClient.delete(`/files/delete?key=${notice.value.imagePath}`);
                console.log(response.data);
            }

            const formData = new FormData();
            formData.append("file", selectedImage.value);
            formData.append("key", `notices/${Date.now()}_${selectedImage.value.name}`);

            const response = await apiClient.post(`/files/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                // 업로드 진행바 계산
                onUploadProgress: (progressEvent) => {
                    uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                },
            });

            if (response.status === 200) {
                // 성공하면 파일의 경로를 저장
                params.imagePath = response.data;
            }
        }
    } catch (error) {
        uploadError.value = true;
        uploadErrorMessage.value = `${t("message.image_upload_error")}: ${error.message}`;
        console.error("이미지 업로드 오류:", error);
    } finally {
        selectedImage.value = null; // 업로드 후 파일 선택 초기화 (선택 사항)
        uploadProgress.value = 0;
    }

    // 게시글 내용 저장
    try {
        if (isEditMode.value) {
            await apiClient.put(`/notice/${noticesId}`, params);
            alert(t("messages.updated_successfully", {itemName: t("title.notice")}));
            router.push(`/notices/${noticesId}`);
        } else {
            await apiClient.post("/notice/", params);
            alert(t("messages.created_successfully", {itemName: t("title.notice")}));
            router.push(`/notices`);
        }
    } catch (error) {
        alert(error.response?.data.message || "알 수 없는 오류 발생");
    }
};

// 데이터 가져오는 함수
const fetchData = async () => {
    if (isEditMode.value) {
        const response = await apiClient.get(`/notice/${isEditMode.value}`);
        if (response.status === 200) {
            notice.value = response.data.data;
            title.value = notice.value.title;
            content.value = notice.value.content;

            // s3Image 키가 존재하면 이미지 로드 함수 호출
            if (notice.value.imagePath) {
                loadImageAndHandleMemory(notice.value.imagePath);
            } else {
                loadImageAndHandleMemory(null); // s3Image가 없으면 이미지 초기화
            }
        } else {
            alert(t("errors.fetch_data_failed"));
        }
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

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(() => {
    fetchData();
});

const goBack = () => {
    router.go(-1);
};
</script>
