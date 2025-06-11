<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :userRole="authStore.isAdmin"
            :buttons="filteredActionButtons" />
        <!-- 테이블 -->
        <DynamicTable :columns="orderColumns" :items="orders" :showCheckbox="false" :page="currentPage"
            :pageSize="pageSize" @row-click="handleRowClick" :isLoading="isTableLoading" uniqueKey="orderId">
            <template #cell-reason="{ item }">
                <p v-if="item.reason == 'DEFECTIVE'">제품 불량</p>
                <p v-else-if="item.reason == 'DAMAGE'">제품 파손</p>
                <p v-else-if="item.reason == 'DISSATISFIED'">품질 불만족</p>
                <p v-else>기타</p>
            </template>
            <template #cell-status="{ item }">
                <strong class="text-orange-500" v-if="item.status === 'EXCHANGE'">대기</strong>
                <strong class="text-green-700" v-else-if="item.status === 'COMPLETE'">승인</strong>
                <strong class="text-red-500" v-else>거부</strong>
            </template>
        </DynamicTable>
        <!-- 페이지 네비 -->
        <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" @set-page="handleSetPage" />
        <ChildOrders :orderList="childOrder" />
        <!-- 알림 모달 -->
        <ClaimModal :visible="showModal" :claimData="claimData" @update:visible="showModal = $event"
            @confirm="claimApproval" @cancel="claimRefusal" />
    </div>
</template>

<script setup>
import apiClient from "@/api";
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import ClaimModal from "@/components/common/modal/ClaimResponseModal.vue";
import {ref, watch, onMounted, computed} from "vue";
import {useRoute,useRouter} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";
import Breadcrumb from '@/components/common/Breadcrumb.vue';
import ChildOrders from '@/pages/user/order/ChildOrders.vue';

const authStore = useAuthStore();

const isTableLoading = ref(false); // 로딩 상태 관리

const {t, locale} = useI18n();
const selectedLang = ref(locale.value === "ko" ? "KOR" : "ENG");

const showModal = ref(false); // 모달 보이기
const claimData = ref([]); // 클레임 데이터

const route = useRoute();
const router = useRouter();

const currentOrderId = ref(route.params.orderId || null); // 현재 주문 ID
const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(0); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)

const selectedId = ref([]); // 선택된 항목 ID

const searchQuery = ref(""); // 검색어
const selectOption = ref(""); // 검색 옵션

const orders = ref([]);
const childOrder = ref([]);
const orderCode = ref("");

// 추가: EXCHANGE 상태 여부를 저장할 변수
const hasExchangeStatus = ref(false); // 초기값은 false
const isEmptyChildOrder = ref(false);

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

// 액션 버튼 정의
const actionButtons = ref([
    {
        label: "주문요청",
        color: "bg-orange-500 hover:bg-orange-700",
        action: () => cliamOrder(),
        allowedRoles: ["user"],
    },
]);

// 액션 버튼 필터링
const filteredActionButtons = computed(() => {
    // hasExchangeStatus가 true이면 빈 배열을 반환하여 액션 버튼을 숨김
    if (hasExchangeStatus.value && isEmptyChildOrder.value) { // .value로 반응형 값에 접근
        return [];
    }
    if (!isEmptyChildOrder.value) {
        return [];
    }
    // hasExchangeStatus가 false이면 원래의 actionButtons를 반환
    return actionButtons.value; // .value로 반응형 값에 접근
});

// 'COMPLETE' 상태의 주문 항목을 필터링하고 API 형식에 맞게 변환하는 함수
const getCompletedOrderItems = () => {
    // 1. 'COMPLETE' 상태인 주문 항목만 필터링
    const completedOrders = orders.value.filter(order => order.status === 'COMPLETE');

    // 2. 필터링된 각 항목을 백엔드가 기대하는 형태로 매핑
    const productsArray = completedOrders.map(order => ({
        productId: order.productId,
        quantity: order.quantity,
    }));

    return productsArray;
};

// 클레임에 대한 하위 주문 생성
async function cliamOrder() {
    // 'COMPLETE' 상태의 product 배열 가져오기
    const productsForRequest = getCompletedOrderItems();
    const childParams = {
        product: productsForRequest,
        orderId: currentOrderId.value,
    };
    const result = await apiClient.post(`/order/child`, childParams);
    if (result.status === 200) {
        const orderId = result.data.data;
        // 부모 주문의 배송상태를 회수로 바꿈
        apiClient.put(`order/${currentOrderId.value}/status?requestStatus=COLLECT`)

        router.push({name: "OrderItemList", query: {orderId: orderId}});
    } else {
        alert(t("errors.fetch_data_failed"));
    }
    fetchData();
}

// ------- 테이블 --------
const orderColumns = ref([
    {label: "품목", key: "productName"},
    {label: "사유", key: "reason"},
    {label: "거래처", key: "companyName"},
    {label: "주문수량", key: "quantity"},
    {label: "상태", key: "status"},
]);

// 데이터 가져오는 함수
const fetchData = async () => {
    isTableLoading.value = true;
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
            orderCode.value = response.data.data.content[0].orderCode;
            console.log(response.data.data);
            totalPages.value = response.data.data.page.totalPages; // 총 페이지 수 할당

            hasExchangeStatus.value = orders.value.some(order => order.status === 'EXCHANGE');
            console.log(hasExchangeStatus.value);
        } else {
            alert(t("errors.fetch_data_failed"));
        }

        //
        const childOrderResponse = await apiClient.get(`/order/${currentOrderId.value}/children`)
        if(childOrderResponse.status === 200) {
            console.log(childOrderResponse.data.data);
            childOrder.value = childOrderResponse.data.data;
            console.log(childOrder.value);
            isEmptyChildOrder.value = (childOrder.value.length === 0);
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
    }finally {
        isTableLoading.value = false; // 로딩 종료
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

const claimApproval = (inputValue) => {
    confirmModal(inputValue,"COMPLETE");
}
const claimRefusal = (inputValue) => {
    confirmModal(inputValue,"CANCEL")
}
// 모달의 '승인'' 버튼 클릭 시 호출되는 중앙 함수
async function confirmModal(inputValue, status) {
    try {
        await apiClient.patch(`/claim/${inputValue}/status`, {status: status});
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
