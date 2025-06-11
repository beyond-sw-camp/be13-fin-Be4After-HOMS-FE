<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />
        <div class="p-6 bg-white rounded-md shadow-md">
            <h4 class="text-xl font-bold mb-4">{{ isEditMode ? $t("btn.edit") : "추가" }}</h4>
            <form @submit.prevent="submitForm">
                <div class="flex gap-10">
                    <!-- 이미지 -->
                    <div class="mb-4 my-4 w-60">
                        <img v-if="imageUrl" :src="imageUrl" alt="제품 이미지"
                            class="w-full max-h-96 object-contain rounded-md shadow-md" />
                        <div v-else
                            class="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md shadow-md">
                            <span class="text-gray-500">이미지 없음</span>
                        </div>
                        <div class="mt-10 flex justify-center">
                            <input type="file" id="imageInput" ref="imageInput"
                                @change="handleFileChange('s3Image', $event)" accept="image/*" class="hidden" />
                            <button @click="triggeFileInput(imageInput)" type="button"
                                class="w-40 px-6 py-3 w-1/6 bg-orange-600 text-white font-bold hover:bg-orange-700 transition cursor-pointer">
                                업로드
                            </button>
                        </div>
                    </div>
                    <!-- 제품 정보 -->
                    <div>
                        <div class="mb-4">
                            <label for="productName" class="block text-sm font-medium text-gray-700">제품코드</label>
                            <input type="text" id="productName" :placeholder="'ex) 303'" v-model="productName"
                                class="w-30 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                        <div class="mb-4">
                            <label for="categoryLevel1" class="block text-sm font-medium text-gray-700">분야</label>
                            <select id="categoryLevel1" v-model="selectedCategoryLevel1"
                                @change="loadSecondLevelCategories">
                                <option value="" disabled>선택하세요</option>
                                <option v-for="category in topLevelCategories" :key="category.categoryId"
                                    :value="category.categoryId">
                                    {{ category.categoryName }}
                                </option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label v-if="secondLevelCategories.length > 0" for="categoryLevel2"
                                class="block text-sm font-medium text-gray-700">분류</label>
                            <select v-if="secondLevelCategories.length > 0" id="categoryLevel2"
                                v-model="selectedCategoryLevel2" @change="loadThirdLevelCategories">
                                <option value="" disabled>선택하세요</option>
                                <option v-for="category in secondLevelCategories" :key="category.categoryId"
                                    :value="category.categoryId">
                                    {{ category.categoryName }}
                                </option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label v-if="thirdLevelCategories.length > 0" for="categoryLevel3"
                                class="block text-sm font-medium text-gray-700">제조 공정</label>
                            <select v-if="thirdLevelCategories.length > 0" id="categoryLevel3"
                                v-model="selectedCategoryLevel3">
                                <option value="" disabled>선택하세요</option>
                                <option v-for="category in thirdLevelCategories" :key="category.categoryId"
                                    :value="category.categoryId">
                                    {{ category.categoryName }}
                                </option>
                            </select>
                        </div>
                        <div class="mb-4">
                            <label for="productMinQuantity" class="block text-sm font-medium text-gray-700">최소
                                수량</label>
                            <input type="text" id="productMinQuantity" :placeholder="'ex) 10'"
                                v-model="productMinQuantity"
                                class="w-30 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        </div>
                    </div>
                    <!-- 적용 용도 / 제품 특징 -->
                    <div>
                        <div class="mb-2">
                            <label for="productUsage" class="block text-sm font-medium text-gray-700">적용 용도</label>
                            <textarea id="productUsage" :placeholder="$t('placeholder.content_input')"
                                v-model="productUsage"
                                class="w-[20rem] border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 h-[5rem]"></textarea>
                        </div>
                        <div class="mb-4 my-4">
                            <label for="productFeature" class="block text-sm font-medium text-gray-700">제품 특징</label>
                            <textarea id="productFeature" :placeholder="$t('placeholder.content_input')"
                                v-model="productFeature"
                                class="w-[20rem] border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-orange-500 h-[5rem]"></textarea>
                        </div>
                    </div>
                    <!-- 파일 업로드 -->
                    <div>
                        <div class="mb-4">
                            <label for="msdsInput" class="block text-sm font-medium text-gray-700">MSDS</label>
                            <input type="file" id="msdsInput" ref="msdsInput"
                                @change="handleFileChange('s3Msds', $event)" accept="application/pdf" class="hidden" />
                            <button @click="triggeFileInput(msdsInput)" type="button"
                                class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">파일
                                선택</button>
                            <p v-if="selectedFiles.s3Msds">선택된 파일: {{ selectedFiles.s3Msds.name }}</p>
                        </div>
                        <div class="mb-4">
                            <label for="tds1Input" class="block text-sm font-medium text-gray-700">TDS</label>
                            <input type="file" id="tds1Input" ref="tds1Input"
                                @change="handleFileChange('s3Tds1', $event)" accept="application/pdf" class="hidden" />
                            <button @click="triggeFileInput(tds1Input)" type="button"
                                class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">파일
                                선택</button>
                            <p v-if="selectedFiles.s3Tds1">선택된 파일: {{ selectedFiles.s3Tds1.name }}</p>
                        </div>
                    </div>
                </div>
                <!-- 저장/취소 버튼 -->
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

// 수정용 데이터
const productsId = ref(route.query.productId || "");
const productName = ref("");
const productUsage = ref("");
const productFeature = ref("");
const productMinQuantity = ref("");
const isEditMode = ref(route.query.productId);
const orginImage = ref("");
const orginMsds = ref("");
const orginTds1 = ref("");

// 데이터 속성 정의
const categoryData = ref([]);
const topLevelCategories = ref([]);
const secondLevelCategories = ref([]);
const thirdLevelCategories = ref([]);
const selectedCategoryLevel1 = ref(null);
const selectedCategoryLevel2 = ref(null);
const selectedCategoryLevel3 = ref(null);
const selectedCategoryId = ref(null);

// 이미지 업로드 관련 상태
const imageUrl = ref("");
const uploadProgress = ref(0);
const uploadError = ref(false);
const uploadErrorMessage = ref("");

// 파일 선택 관련 상태
const imageInput = ref(null);
const msdsInput = ref(null);
const tds1Input = ref(null);

const selectedFiles = ref({}); // 모든 선택된 파일을 저장할 객체

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) => {
    const langCode = newLang === "KOR" ? "ko" : "en";
    locale.value = langCode;
    localStorage.setItem("selectedLang", langCode);
});

const handleFileChange = (fileName, event) => {
    const file = event.target.files[0];
    if (file) {
        selectedFiles.value[fileName] = file;
    } else {
        // 파일 선택 취소 시 해당 타입의 파일 제거
        delete selectedFiles.value[fileName];
    }
    if (fileName === "s3Image") {
        imageUrl.value = URL.createObjectURL(file);
    }
    event.target.value = ""; // input 초기화
};

// "업로드" 버튼을 클릭했을 때 실행될 함수
const triggeFileInput = (inputRef) => {
    inputRef.click();
};

// 글 저장
const submitForm = async () => {
    if (selectedCategoryLevel3.value) {
        selectedCategoryId.value = selectedCategoryLevel3.value;
    } else if (selectedCategoryLevel2.value) {
        selectedCategoryId.value = selectedCategoryLevel2.value;
    } else {
        alert("분류를 선택해주세요!!");
        return 0;
    }

    const params = {
        productName: productName.value,
        productUsage: productUsage.value,
        productFeature: productFeature.value,
        productMinQuantity: productMinQuantity.value,
        categoryId: selectedCategoryId.value,
    };

    try {
        if (isEditMode.value) {
            // 수정모드라면
            await apiClient.put(`/product/${productsId.value}`, params);
        } else {
            const response = await apiClient.post("/product/", params);
            productsId.value = response.data.data.productId;
        }

        // 만약에 파일이 존재하면 파일 저장
        if (selectedFiles.value.s3Image || selectedFiles.value.s3Msds || selectedFiles.value.s3Tds1) {
            await fileUpload();
        } else {
            // 없으면 그대로 돌려보냄
            if (isEditMode.value) {
                alert(t("messages.updated_successfully", {itemName: t("title.product")}));
                router.push(`/products/`);
            } else {
                alert("상품이 추가되었습니다.");
                router.push(`/products/`);
            }
        }
    } catch (error) {
        alert(error.response?.data.message || "알 수 없는 오류 발생");
    }
};

// 파일 업로드
const fileUpload = async () => {
    // 파일 업로드
    try {
        // 만약에 수정모드면 원본 파일 제거
        if (isEditMode.value) {
            if (selectedFiles.value.s3Image && orginImage.value) {
                await apiClient.delete(`/files/delete?key=${orginImage.value}`);
            }
            if (selectedFiles.value.s3Msds && orginMsds.value) {
                await apiClient.delete(`/files/delete?key=${orginMsds.value}`);
            }
            if (selectedFiles.value.s3Tds1 && orginTds1.value) {
                await apiClient.delete(`/files/delete?key=${orginTds1.value}`);
            }
        }

        const formData = new FormData();
        // s3Image 파일이 존재할 때만 formData에 추가
        if (selectedFiles.value.s3Image) {
            console.log(selectedFiles.value.s3Image);
            formData.append("s3Image", selectedFiles.value.s3Image);
        }
        // s3Msds 파일이 존재할 때만 formData에 추가
        if (selectedFiles.value.s3Msds) {
            console.log(selectedFiles.value.s3Msds);
            formData.append("s3Msds", selectedFiles.value.s3Msds);
        }
        // s3Tds1 파일이 존재할 때만 formData에 추가
        if (selectedFiles.value.s3Tds1) {
            console.log(selectedFiles.value.s3Tds1);
            formData.append("s3Tds1", selectedFiles.value.s3Tds1);
        }

        console.log(productsId.value);

        const response = await apiClient.post(`/files/upload-multiple/${productsId.value}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            // 업로드 진행바 계산
            onUploadProgress: (progressEvent) => {
                uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            },
        });
        console.log(response);

        if (response.status === 200) {
            // 성공하면 파일의 경로를 저장
            const params = {
                productId: productsId.value,
                s3Image: response.data.s3Image,
                s3Msds: response.data.s3Msds,
                s3Tds1: response.data.s3Tds1,
            };
            try {
                if (isEditMode.value) {
                    // 상품 수정
                    await apiClient.put(`/product/files`, params);
                    alert(t("messages.updated_successfully", {itemName: t("title.product")}));
                    router.push(`/products/`);
                } else {
                    // 상품 등록
                    await apiClient.post("/product/files", params);
                    alert("상품이 추가되었습니다.");
                    router.push(`/products/`);
                }
            } catch (error) {
                alert(error.response?.data.message || "알 수 없는 오류 발생");
            }
        }
    } catch (error) {
        uploadError.value = true;
        uploadErrorMessage.value = `${t("message.image_upload_error")}: ${error.message}`;
        console.error("파일 업로드 오류:", error);
        if (error.response && error.response.data && error.response.data.error) {
            console.error("서버 상세 오류 메시지:", error.response.data.error);
        }
    } finally {
        // selectedImage.value = null; // 업로드 후 파일 선택 초기화 (선택 사항)
        uploadProgress.value = 0;
    }
};

const goBack = () => {
    router.go(-1);
};

// 데이터 가져오는 함수
const fetchData = async () => {
    try {
        // 카테고리 데이터 가져오기
        const response = await apiClient.get("/productCategory/");
        if (response.status === 200) {
            console.log(response.data.data);
            categoryData.value = response.data.data;
            topLevelCategories.value = [...categoryData.value].sort((a, b) => a.sortNo - b.sortNo);
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
    }

    if (isEditMode.value) {
        // 수정 모드일 때 수정데이터 가져오기
        const response = await apiClient.get(`/product/${isEditMode.value}`);
        if (response.status === 200) {
            const products = response.data.data;
            console.log(products);
            productName.value = products.productName;
            productUsage.value = products.productUsage;
            productFeature.value = products.productFeature;
            productMinQuantity.value = products.productMinQuantity;
            selectedCategoryLevel1.value = products.category.domainId;
            selectedCategoryLevel2.value = products.category.categoryId;
            if (products.category.processId) {
                selectedCategoryLevel3.value = products.category.processId;
            }
            loadSecondLevelCategories();
            loadThirdLevelCategories();
        } else {
            alert(t("errors.fetch_data_failed"));
        }

        try {
            const response = await apiClient.get(`/product/files/${productsId.value}`);
            if (response.status === 200) {
                orginImage.value = response.data.data.s3Image;
                orginMsds.value = response.data.data.s3Msds;
                orginTds1.value = response.data.data.s3Tds1;

                // s3Image 키가 존재하면 이미지 로드 함수 호출
                if (orginImage.value) {
                    loadImageAndHandleMemory(orginImage.value);
                } else {
                    loadImageAndHandleMemory(null); // s3Image가 없으면 이미지 초기화
                }
            }
        } catch {
            console.log("불러올 파일이 없음");
            loadImageAndHandleMemory(null); // 파일 데이터가 없으면 이미지도 초기화
        }
    }
};

// 첫 번째 드롭다운 선택 시 두 번째 드롭다운 데이터 로딩
const loadSecondLevelCategories = () => {
    if (selectedCategoryLevel1.value) {
        const selectedTopLevelCategory = categoryData.value.find((category) => category.categoryId === selectedCategoryLevel1.value);
        if (selectedTopLevelCategory && selectedTopLevelCategory.children) {
            secondLevelCategories.value = [...selectedTopLevelCategory.children].sort((a, b) => a.sortNo - b.sortNo);
            thirdLevelCategories.value = [];
        } else {
            secondLevelCategories.value = [];
            thirdLevelCategories.value = [];
            selectedCategoryLevel2.value = null;
            selectedCategoryLevel3.value = null;
        }
    } else {
        secondLevelCategories.value = [];
        thirdLevelCategories.value = [];
        selectedCategoryLevel2.value = null;
        selectedCategoryLevel3.value = null;
    }
};

// 두 번째 드롭다운 선택 시 세 번째 드롭다운 데이터 로딩
const loadThirdLevelCategories = () => {
    if (selectedCategoryLevel2.value) {
        const selectedSecondLevelCategory = secondLevelCategories.value.find((category) => category.categoryId === selectedCategoryLevel2.value);
        if (selectedSecondLevelCategory && selectedSecondLevelCategory.children) {
            thirdLevelCategories.value = [...selectedSecondLevelCategory.children].sort((a, b) => a.sortNo - b.sortNo);
            //   selectedCategoryLevel3.value = null;
        } else {
            thirdLevelCategories.value = [];
            selectedCategoryLevel3.value = null;
        }
    } else {
        thirdLevelCategories.value = [];
        selectedCategoryLevel3.value = null;
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
</script>
