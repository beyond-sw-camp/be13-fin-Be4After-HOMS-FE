<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-gray-900 opacity-60"></div>
        <div class="relative bg-white shadow-lg w-2xl max-w-5xl text-left z-10 pb-10">
            <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-2 p-2">
                <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="onClose" />
            </div>
            <div class="p-6">
                <div class="flex items-center">
                    <p class="mb-6 text-gray-700 text-3xl font-extrabold">제품 상세 정보</p>
                    <div class="ml-auto">
                        <button v-if="productFiles?.s3Msds" @click="downloadFile(productFiles.s3Msds)" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">
                            MSDS
                        </button>
                        <button v-if="productFiles?.s3Tds1" @click="downloadFile(productFiles.s3Tds1)" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">
                            TDS
                        </button>
                    </div>
                </div>

                <div class="mb-8 flex">
                    <img v-if="productImageUrl" :src="productImageUrl" :alt="productDetail?.productName || '제품 이미지'" class="w-full h-48 object-contain rounded-md shadow-md" />
                    <div v-else class="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md shadow-md">
                        <span class="text-gray-500">이미지 없음</span>
                    </div>
                    <div class="ml-8 w-full">
                        <label class="block text-gray-700 font-semibold mb-1">제품명</label>
                        <div class="mb-5 border border-gray-300 rounded-md py-2 px-3 text-gray-800">
                            {{ productDetail?.productName || "-" }}
                        </div>
                        <label class="block text-gray-700 font-semibold mb-1">제조공정</label>
                        <div class="border border-gray-300 rounded-md py-2 px-3 text-gray-800">
                            {{ productDetail?.category.manufacturingProcess || "-" }}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-x-6 gap-y-4 mb-8">
                    <div>
                        <label class="block text-gray-700 font-semibold mb-1">제품 특징</label>
                        <div class="border border-gray-300 rounded-md py-2 px-3 text-gray-800 whitespace-pre-line">
                            {{ productDetail?.productFeature || "-" }}
                        </div>
                    </div>
                    <div>
                        <label class="block text-gray-700 font-semibold mb-1">적용 용도</label>
                        <div class="border border-gray-300 rounded-md py-2 px-3 text-gray-800 whitespace-pre-line">
                            {{ productDetail?.productUsage || "-" }}
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-8">
                    <button @click="onClose" class="px-6 py-3 w-1/6 bg-slate-500 text-white font-bold hover:bg-slate-600 transition">닫기</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import xmark from "@/assets/xmark.svg";
import {ref, watch, onBeforeUnmount} from "vue";
import {useI18n} from "vue-i18n";
import apiClient from "@/api";
import {downloadBlob, getFilenameFromHeaders} from "@/utils/fileDownloader";
import {loadAndCreateImageURL, revokeImageURL} from "@/utils/imageView";

const {t} = useI18n();

// `defineProps()`를 사용하여 props를 올바르게 선언
const props = defineProps({
    visible: Boolean,
    productId: {
        type: Number,
        // default: () => ({}),
        default: () => null,
    },
});

const emit = defineEmits(["close"]);

function onClose() {
    emit("close");
}

const productDetail = ref(null);
const productFiles = ref(null);
const productImageUrl = ref(null); // 이미지 URL 저장용

// --- 이미지 로드 및 메모리 관리 로직 시작 ---
const loadImageAndHandleMemory = async (s3Key) => {
    // 기존 이미지 URL이 있다면 먼저 해제
    if (productImageUrl.value) {
        revokeImageURL(productImageUrl.value);
        productImageUrl.value = null; // 해제 후 null로 설정
    }

    if (s3Key) {
        productImageUrl.value = await loadAndCreateImageURL(apiClient, s3Key);
    }
};

// 모달이 닫히거나 컴포넌트가 언마운트될 때 이미지 URL 해제
onBeforeUnmount(() => {
    if (productImageUrl.value) {
        revokeImageURL(productImageUrl.value);
    }
});
// --- 이미지 로드 및 메모리 관리 로직 끝 ---

// 데이터 가져오는 함수
const fetchData = async (productId) => {
    if (!productId) return; // productId가 없으면 데이터 로드 안함
    try {
        const response = await apiClient.get(`/product/${productId}`);
        if (response.status === 200) {
            productDetail.value = response.data.data;
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_error"), err);
    }

    // 파일 데이터 가져오기
    try {
        const response = await apiClient.get(`/product/files/${productId}`);
        if (response.status === 200) {
            console.log(response.data.data);
            productFiles.value = response.data.data;

            // s3Image 키가 존재하면 이미지 로드 함수 호출
            if (productFiles.value.s3Image) {
                loadImageAndHandleMemory(productFiles.value.s3Image);
            } else {
                loadImageAndHandleMemory(null); // s3Image가 없으면 이미지 초기화
            }
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        // console.error(t('errors.fetch_data_error'), err);
        console.log("파일 데이터 없음");
        productFiles.value = null;
        loadImageAndHandleMemory(null); // 파일 데이터가 없으면 이미지도 초기화
    }
};

// 모달이 열릴 때 감지해서 데이터 로딩
watch(
    () => [props.visible, props.productId],
    ([newVisible, newProductId], oldValues = [undefined, undefined]) => {
        // undefined로 기본값 설정
        // oldValues가 undefined가 아닐 때만 구조 분해 할당
        const oldVisible = oldValues[0];
        const oldProductId = oldValues[1];

        // 이제 oldVisible, oldProductId는 첫 실행 시 undefined가 되므로 안전하게 비교 가능
        if (newVisible && newProductId && (newVisible !== oldVisible || newProductId !== oldProductId)) {
            fetchData(newProductId);
        } else if (!newVisible) {
            productDetail.value = null;
            productFiles.value = null;
            loadImageAndHandleMemory(null);
        }
    },
    {immediate: true}
);

// 파일 다운로드
const downloadFile = async (fileKey) => {
    if (!fileKey) {
        alert("다운로드할 파일이 없습니다.");
        return;
    }

    try {
        const response = await apiClient.get(`/files/download?key=${fileKey}`, {
            responseType: "blob",
        });

        // 파일 이름 파싱
        const filename = getFilenameFromHeaders(response.headers);

        // Blob 데이터 생성
        const blob = new Blob([response.data], {type: response.headers["content-type"] || "application/octet-stream"});

        // 파일 다운로드
        downloadBlob(blob, filename);
    } catch (error) {
        console.error("파일 다운로드 실패:", error);
        alert("파일 다운로드 실패");
    }
};
</script>
