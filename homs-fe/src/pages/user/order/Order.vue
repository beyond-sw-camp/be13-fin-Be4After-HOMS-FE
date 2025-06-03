<template>
    <div>
        <!-- 제목 -->
        <div class="text-3xl px-3 py-3">
            <span>주문관리 > 주문목록</span>
        </div>
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :userRole="authStore.isAdmin" />
        <!-- 테이블 -->
        <DynamicTable :columns="orderColumns" :items="orders" :showCheckbox="false" :page="currentPage"
            :pageSize="pageSize" @selected="handleSelectedItems" @row-click="handleRowClick" uniqueKey="orderId">
            <!-- 항목 상세 설정 -->
            <template #cell-orderDate="{ item }">
                {{ new Date(item.orderDate).toLocaleDateString() }}
            </template>
            <template #cell-dueDate="{ item }">
                {{ new Date(item.dueDate).toLocaleDateString() }}
            </template>
            <template #cell-approved="{ item }">
                <strong v-if="item.approved === true">승인</strong>
                <strong v-else-if="item.approved === false && item.rejectReason !== null">거부</strong>
                <strong v-else>미승인</strong>
            </template>
            <template #cell-productQuantity="{ item }">
                <div v-if="item && item.productQuantity === null">데이터 없음</div>
                <div v-else-if="item && item.productQuantity !== undefined && !item.isEditing">{{ item.productQuantity
                }}</div>
                <div v-else-if="item && item.productQuantity !== undefined && item.isEditing">
                    <input type="number"
                        class="rounded mr-2 border-1 border-gray-300 w-15 focus:border-orange-500 focus:outline-none"
                        min="1" max="9999" v-model.number="item.productQuantity" @click.stop @mousedown.stop />
                </div>
                <div v-else>데이터 오류</div>
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
        <!-- 거부/승인 모달 -->
        <Notify :visible="showModal" :text="modalText" :showTextArea="showTextAreaInput"
            :textAreaPlaceholder="textAreaHint" @update:visible="showModal = $event" @confirm="approvedConfirmModal"
            @cancel="showModal = false" />
        <!-- 알림 모달 -->
        <ConfirmModal :visible="showConfirmModal" :text="modalText" :type="modalType" :alert="alert"
            @update:visible="showConfirmModal = $event" @confirm="confirmModal"></ConfirmModal>
    </div>
</template>

<script setup>
import apiClient from "@/api";
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import Notify from "@/components/common/modal/NotifyModal.vue";
import ConfirmModal from "@/components/common/modal/ConfirmModal.vue";
import {ref, watch, onMounted} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";

const authStore = useAuthStore();

const {t, locale} = useI18n();
const selectedLang = ref(locale.value === "ko" ? "KOR" : "ENG");

const showModal = ref(false); // 모달 보이기
const modalText = ref(""); // 모달 텍스트
const currentActionType = ref("");
const showTextAreaInput = ref(false); // textarea를 보여줄지 말지
const textAreaHint = ref(""); // textarea의 힌트 텍스트

const currentOrderId = ref(null); // 현재 주문 ID

const router = useRouter();
const route = useRoute();

const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(0); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)

const selectedUserIds = ref([]); // 선택된 항목 ID

const searchQuery = ref(""); // 검색어
const selectOption = ref(""); // 검색 옵션

// 알람 모달 관련
const showConfirmModal = ref(false); // 알람 모달 상태
const modalType = ref(""); // 알람 모달 식별 타입
const alert = ref(false); // 알람 모달 여부

// ------- 검색바 --------
const handleSearch = (searchData) => {
    searchQuery.value = searchData.searchQuery;
    selectOption.value = searchData.selectOption;
    pageSize.value = searchData.size;
    currentPage.value = 1;
    fetchData();
};
// 검색 필터 목록
const handleSelectOption = ref([
    {value: "ORDER_CODE", label: "발주번호"},
    {value: "COMPANY_NAME", label: "거래처명"},
]);

// ------- 테이블 --------
const orderColumns = ref([
    {label: "발주번호", key: "orderCode"},
    {label: "거래처명", key: "companyName"},
    {label: "납품장소", key: "deliveryName"},
    {label: "요청일", key: "orderDate"},
    {label: "납기일", key: "dueDate"},
    {label: "승인상태", key: "approved"},
]);

const orders = ref([
    {id: 1, orderCode: "H-04-23", companyName: "영광상사", deliveryName: "서울", orderDate: "25-04-02", settlementDate: "25-04-11"},
    {id: 2, orderCode: "H-04-23", companyName: "영광상사", deliveryName: "서울", orderDate: "25-04-02", settlementDate: "25-04-11"},
    {id: 3, orderCode: "H-04-23", companyName: "하이젠버그", deliveryName: "미국", orderDate: "25-04-02", settlementDate: "25-04-11"},
]);

// 승인
const approveOrder = (orderId) => {
    currentOrderId.value = orderId;
    modalText.value = "선택하신 주문을 승인하시겠습니까?";
    currentActionType.value = "approve";
    showTextAreaInput.value = false; // textarea 안보이게
    showModal.value = true;

    console.log("orderId", orderId);

};

// 거절
const rejectOrder = (orderId) => {
    // async 제거
    currentOrderId.value = orderId; // 처리할 주문 ID 저장
    modalText.value = "선택하신 주문을 거절하시겠습니까?";
    currentActionType.value = "reject";
    showTextAreaInput.value = true; // textarea 보이게
    textAreaHint.value = "거절 사유를 입력하세요."; // 힌트 설정
    showModal.value = true; // 모달 열기
};

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
    currentOrderId.value = orderId;
    alert.value = false;
    showConfirmModal.value = true;
    modalText.value = "주문을 취소하시겠습니까?";
    modalType.value = "orderCancle";
};

// 사유 확인
const rejectReasonView = async (orderId) => {
    try {
        const response = await apiClient.get(`/order/${orderId}`);
        if (response.status === 200) {
            alert.value = true;
            showConfirmModal.value = true;
            modalText.value = `
                <strong style="font-size: 1.1em; color: #333;">상세 사유</strong>
                <p style="margin-top: 8px; margin-bottom: 0; line-height: 1.5;">${response.data.data.rejectReason}</p>
            `;
            
        } else {
            alert.value = true;
            showConfirmModal.value = true;
            modalText.value = t("errors.fetch_data_failed");
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
    }
};

// 알림 모달에서 확인이 눌러졌을때
const confirmModal = async () => {
    const orderId = currentOrderId.value;
    if (modalType.value === "orderCancle") {
        try {
            await apiClient.delete(`/order/${orderId}`);

            alert.value = true;
            showConfirmModal.value = true;
            modalText.value = "주문이 취소되었습니다.";

            fetchData();
        } catch (error) {
            alert(error.response.data.message);
        }
    }
}


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
        const response = await apiClient.get("/order/", {
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
const handleRowClick = (item) => {
    console.log("선택된 행:", item.orderId);
    router.push({name: "OrderItemList", query: {orderId: item.orderId}});
};

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(() => {
    console.log(route.query);
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
    selectedUserIds.value = selectedIds;
    console.log("선택된 아이템 ID:", selectedUserIds.value);
    // selectedUserIds.value.length
};

// Notify 모달의 '확인' 버튼 클릭 시 호출되는 중앙 함수
function approvedConfirmModal(inputValue) {
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
