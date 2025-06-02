<template>
    <div>
        <!-- 제목 -->
        <div class="text-3xl px-3 py-3">
            <span>주문관리 > 클레임목록</span>
        </div>
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :userRole="authStore.isAdmin" />
        <!-- 테이블 -->
        <DynamicTable
            :columns="orderColumns"
            :items="orders"
            :showCheckbox="false"
            :page="currentPage"
            :pageSize="pageSize"
            @selected="handleSelectedItems"
            @row-click="handleRowClick"
            uniqueKey="orderId"
        >
            <!-- 항목 상세 설정  DEFECTIVE, DAMAGE, DISSATISFIED, OTHER -->
            <template #cell-reason="{item}">
                <p v-if="item.reason == 'DEFECTIVE'">제품 불량</p>
                <p v-else-if="item.reason == 'DAMAGE'">제품 파손</p>
                <p v-else-if="item.reason == 'DISSATISFIED'">품질 불만족</p>
                <p v-else>기타</p>
            </template>
            <template #actions="{item}">
                <!-- 관리자는 상태를 설정가능 -->
                <div v-if="authStore.isAdmin">
                    <!-- 미승인 상태 -->
                    <div v-if="item.approved === false && item.rejectReason === null">
                        <button @click="rejectOrder(item.orderId)" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">거부</button>
                        <button @click="approveOrder(item.orderId)" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">승인</button>
                    </div>
                </div>

                <!-- 사용자는 취소할 수 있음 -->
                <div v-else>
                    <button
                        v-if="item.approved === false && item.rejectReason === null"
                        @click="cancleBtn(item.orderId)"
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                        취소
                    </button>
                    <button
                        v-else-if="item.approved === false && item.rejectReason !== null"
                        @click="rejectReasonView(item.orderId)"
                        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm"
                    >
                        사유
                    </button>
                </div>
            </template>
        </DynamicTable>

        <!-- 페이지 네비 -->
        <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" @set-page="handleSetPage"> </PageNav>
        <!-- 알림 모달 -->
        <ClaimModal :visible="showModal" :claimData="claimData" @update:visible="showModal = $event" @confirm="confirmModal" @cancel="showModal = false" />
    </div>
</template>

<script setup>
import apiClient from "@/api";
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import ClaimModal from "@/components/common/modal/ClaimRequestModal.vue";
import {ref, watch, onMounted} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";

const authStore = useAuthStore();

const {t, locale} = useI18n();
const selectedLang = ref(locale.value === "ko" ? "KOR" : "ENG");

const showModal = ref(false); // 모달 보이기
const claimData = ref([]); // 클레임 데이터
const currentActionType = ref("");
const showTextAreaInput = ref(false); // textarea를 보여줄지 말지
const textAreaHint = ref(""); // textarea의 힌트 텍스트

const router = useRouter();
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
]);

const orders = ref([]);

// 상태 변경 요청
const setApprove = async (orderId, isApproved, reason) => {
    const requestData = {
        isApproved: isApproved,
        rejectReason: reason,
    };
    try {
        await apiClient.put(`/order/${orderId}/approve`, requestData);
    } catch (error) {
        alert(error.response.data.message);
    }
    fetchData();
};

// 취소
const cancleBtn = async (orderId) => {
    if (confirm("주문을 취소하시겠습니까?")) {
        try {
            await apiClient.delete(`/order/${orderId}`);
            fetchData();
        } catch (error) {
            alert(error.response.data.message);
        }
    }
};

// 사유 확인
const rejectReasonView = async (orderId) => {
    try {
        const response = await apiClient.get(`/order/${orderId}`);
        if (response.status === 200) {
            alert(response.data.data.rejectReason);
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
    }
};

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
            console.log(response.data.data.content);
            // totalPages.value = response.data.data.page.totalPages; // 총 페이지 수 할당
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

// 체크박스 선택된 항목 처리
const handleSelectedItems = (selectedIds) => {
    console.log("선택된 아이템 ID:", selectedUserIds.value);
    // selectedUserIds.value.length
};

// Notify 모달의 '확인' 버튼 클릭 시 호출되는 중앙 함수
function confirmModal(inputValue) {
    if (currentActionType.value === "approve") {
        setApprove(currentOrderId.value, true, null);
    } else if (currentActionType.value === "reject") {
        const reason = inputValue;
        if (reason !== null && reason.trim() !== "") {
            // 입력값이 비어있지 않은지 확인
            setApprove(currentOrderId.value, false, reason);
        } else {
            alert("거절 사유를 입력해야 합니다."); // 사유가 없으면 알림
            console.log("거절이 취소되었습니다: 사유 없음.");
        }
    }
    // 모달이 닫히면 textarea 상태도 초기화
    showTextAreaInput.value = false;
    textAreaHint.value = "";
}

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) => {
    const langCode = newLang === "KOR" ? "ko" : "en";
    locale.value = langCode;
    localStorage.setItem("selectedLang", langCode);
});
</script>
