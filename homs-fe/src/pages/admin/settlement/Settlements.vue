<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />

        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" />
        <!-- 테이블 -->
        <DynamicTable :columns="userColumns" :items="users" :showCheckbox="false" :page="currentPage"
            :pageSize="pageSize" :isLoading="isTableLoading" action="세금계산서">
            <template #cell-isSettled="{ item }">
                <span :class="{
                    'text-red-500': item.isSettled === '미정산',
                    'text-yellow-500': item.isSettled === '대기',
                    'text-green-500': item.isSettled === '완료',
                }">
                    {{ item.isSettled }}
                </span>
            </template>
            <template #actions="{ item }">
                <button @click="item.isSettled === '완료' ? checkIssuedInvoice(item) : issuingTaxInvoices(item)"
                    :class="['text-white font-bold py-2 px-4 rounded text-sm justify-center flex', item.isSettled === '완료' ? 'bg-gray-400 hover:bg-gray-500' : 'bg-orange-500 hover:bg-orange-700']">
                    {{ item.isSettled === "완료" ? "확인" : "발행" }}
                </button>
            </template>
        </DynamicTable>
        <!-- 페이지 네비 -->
        <PageNav :currentPage="currentPage" :totalPages="totalPages" @set-page="handleSetPage"></PageNav>

        <TaxInvoice :visible="showTIModal" :order-id="selectedOrderId" @confirm="confirmModal" />
        <CheckTaxInvoice :visible="showCheckModal" @confirm="confirmCheckTaxInvoice"></CheckTaxInvoice>
    </div>
</template>

<script setup>
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import TaxInvoice from "@/components/common/modal/TaxInvoice.vue";
import CheckTaxInvoice from "@/components/common/modal/CheckTaxInvoice.vue";
import {ref, onMounted} from "vue";
import apiClient from "@/api";
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const isTableLoading = ref(false); // 로딩 상태 관리

const searchResult = ref(null);
const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(1); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)
// 모달 관련
const showTIModal = ref(false);
const showCheckModal = ref(false);

const selectedOrderId = ref(null);

// 데이터
const users = ref([]);

const handleSelectOption = ref([
    {value: "", label: "전체"},
    {value: "important", label: "중요"},
    {value: "recent", label: "최근"},
]);

const fetchData = async () => {
    isTableLoading.value = true;
    try {
        const response = await apiClient.get("/settlement/");
        const data = response.data.data;
        console.log("정산 데이터", data);

        data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        
        users.value = data.map((item, index) => ({
            id: item.orderId,
            orderCode: item.orderCode,
            companyName: item.companyName,
            deliveryName: item.companyAddress,
            orderDate: new Date(item.orderDate).toISOString().split("T")[0],
            settlementDate: new Date(item.settlementDate).toISOString().split("T")[0],
            isSettled: mapSettlementStatus(item.isSettled),
            orderStatus: item.orderStatus ?? "-",
        }));
    } catch (error) {
        console.log("정산 테이블을 불러오는데 실패 하였습니다", error);
    } finally {
        isTableLoading.value = false; // 로딩 종료
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

// ------- 검색바 --------
const handleSearch = (searchData) => {
    console.log("검색 데이터:", searchData);
    // 여기서 검색 로직을 처리하거나 부모 컴포넌트로 데이터를 전달할 수 있습니다.
    searchResult.value = searchData;
};

// ------- 테이블 --------
//헤더
const userColumns = ref([
    {label: "주문번호", key: "orderCode"},
    {label: "거래처명", key: "companyName"},
    {label: "납품장소", key: "deliveryName"},
    {label: "요청일", key: "orderDate"},
    {label: "정산일", key: "settlementDate"},
    {label: "정산여부", key: "isSettled"},
    {label: "상태", key: "orderStatus"},
]);

// ------- 페이지네이션 --------
const handleSetPage = (page) => {
    console.log("페이지 변경 요청:", page);
    currentPage.value = page;
    // 여기서 해당 페이지의 데이터를 불러오는 로직 등을 수행해야 합니다.
};

const issuingTaxInvoices = (order) => {
    showTIModal.value = true;
    selectedOrderId.value = order.id;
};

const checkIssuedInvoice = (order) => {
    showCheckModal.value = true;
};

// 모달 확인
function confirmModal() {
    showTIModal.value = false;
    fetchData();
}

const confirmCheckTaxInvoice = (order) => {
    showCheckModal.value = false;
};

onMounted(() => {
    fetchData();
});
</script>
