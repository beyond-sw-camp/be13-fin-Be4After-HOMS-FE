<template>
    <div>
        <!-- 제목 -->
        <div class="text-3xl px-3 py-3">
            <span>주문관리 > 클레임목록</span>
        </div>
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :userRole="authStore.isAdmin" />
        <!-- 테이블 -->
        <DynamicTable :columns="orderColumns" :items="orders" :showCheckbox="false" :page="currentPage"
            :pageSize="pageSize" @row-click="handleRowClick" uniqueKey="orderId">
            <template #cell-reason="{ item }">
                <p v-if="item.reason == 'DEFECTIVE'">제품 불량</p>
                <p v-else-if="item.reason == 'DAMAGE'">제품 파손</p>
                <p v-else-if="item.reason == 'DISSATISFIED'">품질 불만족</p>
                <p v-else>기타</p>
            </template>
            <template #cell-status="{ item }">
                <p v-if="item.status === 'EXCHANGE'">반품</p>
                <p v-else-if="item.status === 'COMPLETE'">완료</p>
                <p v-else>취소</p>
            </template>
            <template #actions="{ item }">
                <!-- 관리자는 상태를 설정가능 -->
                <div v-if="authStore.isAdmin">
                    <!-- 미승인 상태 -->
                    <div v-if="item.approved === false && item.rejectReason === null">
                        <button @click="rejectOrder(item.orderId)"
                            class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">거부</button>
                        <button @click="approveOrder(item.orderId)"
                            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">승인</button>
                    </div>
                </div>

                <!-- 사용자는 취소할 수 있음 -->
                <div v-else>
                    <button v-if="item.approved === false && item.rejectReason === null"
                        @click="cancleBtn(item.orderId)"
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
                        취소
                    </button>
                    <button v-else-if="item.approved === false && item.rejectReason !== null"
                        @click="rejectReasonView(item.orderId)"
                        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm">
                        사유
                    </button>
                </div>
            </template>
        </DynamicTable>

        <!-- 페이지 네비 -->
        <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" @set-page="handleSetPage">
        </PageNav>
        <!-- 알림 모달 -->
        <ClaimModal :visible="showModal" :claimData="claimData" @update:visible="showModal = $event"
            @confirm="confirmModal" @cancel="showModal = false" />
    </div>
</template>

<script setup>
import apiClient from "@/api";
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import ClaimModal from "@/components/common/modal/ClaimResponseModal.vue";
import {ref, watch, onMounted} from "vue";
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";

const authStore = useAuthStore();

const {t, locale} = useI18n();
const selectedLang = ref(locale.value === "ko" ? "KOR" : "ENG");

const showModal = ref(false); // 모달 보이기
const claimData = ref([]); // 클레임 데이터

const route = useRoute();

const currentOrderId = ref(route.params.orderId || null); // 현재 주문 ID
const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(0); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)

const selectedId = ref([]); // 선택된 항목 ID

const searchQuery = ref(""); // 검색어
const selectOption = ref(""); // 검색 옵션

// ------- 검색바 --------
const handleSearch = (searchData) => {
    searchQuery.value = searchData.searchQuery;
    selectOption.value = searchData.selectOption;
    pageSize.value = searchData.size;
    currentPage.value = 1;
    fetchData();
};
// 검색 필터 목록
const handleSelectOption = ref([{value: "PRODUCT_NAME", label: "품목"}]);

// ------- 테이블 --------
const orderColumns = ref([
    {label: "품목", key: "productName"},
    {label: "사유", key: "reason"},
    {label: "거래처", key: "companyName"},
    {label: "주문수량", key: "quantity"},
    {label: "상태", key: "status"},
]);

const orders = ref([]);

// 데이터 가져오는 함수
const fetchData = async () => {
    // 기본 요청 파라미터
    const params = {
        page: currentPage.value - 1, // 현재 페이지 번호 -1 (0 기반 인덱스)
        size: pageSize.value,
    };

    if (searchQuery.value && selectOption.value) {
        params.option = selectOption.value;
        params.keyword = searchQuery.value;
    }

    // 쿼리 파라미터 업데이트
    const url = new URL(window.location.origin + route.path);
    for (const key in params) {
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    }

    // 브라우저 주소창 업데이트 (replaceState 사용)
    window.history.replaceState({}, "", url.toString());

    try {
        const response = await apiClient.get(`/claim/${currentOrderId.value}`, {
            params: params, // 여기에 구성한 파라미터 객체를 전달합니다.
        });
        if (response.status === 200) {
            orders.value = response.data.data.content;
            console.log(response.data.data);
            totalPages.value = response.data.data.page.totalPages; // 총 페이지 수 할당
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
    }
};

// 선택한 행에 대한 정보 처리
const handleRowClick = async (item) => {
    selectedId.value = item.claimId; // 선택된 항목 ID 업데이트

    try {
        const response = await apiClient.get(`/claim/${currentOrderId.value}?claimId=${selectedId.value}`);
        if (response.status === 200) {
            claimData.value = response.data.data.content[0];
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
    }

    showModal.value = true;
};

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(() => {
    const queryPage = route.query.page;
    const querySize = route.query.size;
    const queryOption = route.query.option;
    const queryKeyword = route.query.keyword;

    if (queryPage) {
        currentPage.value = parseInt(queryPage) + 1;
    }
    if (querySize) {
        pageSize.value = parseInt(querySize);
    }
    if (queryOption) {
        selectOption.value = queryOption;
    }
    if (queryKeyword) {
        searchQuery.value = queryKeyword;
    }

    console.log(route.params.orderId);
    fetchData();
});

// ------- 페이지네이션 --------
const handleSetPage = (page) => {
    currentPage.value = page;
    fetchData();
};

// ------ 기타 -------

// 모달의 '승인'' 버튼 클릭 시 호출되는 중앙 함수
async function confirmModal(inputValue) {
    try {
        await apiClient.patch(`/claim/${inputValue}/status`, {status: "COMPLETE"});
    } catch (error) {
        alert(error.response.data.message);
    }
    fetchData();
}

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) => {
    const langCode = newLang === "KOR" ? "ko" : "en";
    locale.value = langCode;
    localStorage.setItem("selectedLang", langCode);
});
</script>
