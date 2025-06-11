<template>
    <div>
        <Breadcrumb />

        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" />

        <DynamicTable :columns="deliveryColumns" :items="delivery" :isLoading="isTableLoading"
            @row-click="handleRowClick" />
        <!-- 페이지 네비 -->
        <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" />
        <!-- 배송 상세 모달 -->
        <DeliveryAddressModal :visible="showCheckModal" :data="selectedDelivery" @cancel="cancelCheckTaxInvoice" />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import SearchBox from '@/components/common/SaerchBar.vue';
import DynamicTable from "@/components/common/DynamicTable.vue";
import apiClient from "@/api";
import PageNav from "@/components/common/PageNav.vue";
import DeliveryAddressModal from '@/components/common/modal/DeliveryAddressViewModal.vue';
import Breadcrumb from '@/components/common/Breadcrumb.vue';

// 고정
const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(1); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)

const isTableLoading = ref(false); // 로딩 상태 관리

const delivery = ref([]);
const showCheckModal = ref(false);
const selectedDelivery = ref(null); // 선택된 항목

const currentAddressId = ref();

// ------- 검색바 --------
const handleSearch = (searchData) => {
    searchQuery.value = searchData.searchQuery;
    pageSize.value = searchData.size;
    currentPage.value = 1;
    fetchData();
};

// 검색 필터 목록
const handleSelectOption = ref([
    { value: "", label: "전체" },
]);

// 컬럼 정의
const deliveryColumns = [
    { label: "회사명", key: "companyName" },
    { label: "배송지 명", key: "deliveryName" },
    { label: "납품 장소", key: "streetAddress" },
    { label: "상세 주소", key: "detailedAddress" },
];

// API 호출
const fetchData = async () => {
    try {
        const res = await apiClient.get(`deliveryAdd/`);
        console.log(res);

        if (res.status === 200) {
            delivery.value = res.data.data;
        }
        } catch (e) {
            console.error(e);
    }
};

// 상세 정보 호출
const fetchDetailData = async (addressId) => {
    isTableLoading.value = true;
    try {
        const res = await apiClient.get(`deliveryAdd/${addressId}/detail`);

        if (res.status === 200) {
            selectedDelivery.value = res.data.data;
            showCheckModal.value = true;
        }
        } catch (e) {
            console.error(e);
    }finally {
        isTableLoading.value = false; // 로딩 종료
    }
};


// 선택한 행에 대한 정보 처리
const handleRowClick = (item) => {
    currentAddressId.value = item.addressId; // 선택된 항목 ID 업데이트
    fetchDetailData(currentAddressId.value);
};

const cancelCheckTaxInvoice = () => {
    showCheckModal.value = false
    selectedDelivery.value = null;
}

// 초기 데이터 로딩
onMounted(async () => {
    await fetchData();          // companyId가 설정된 후에 호출
});
</script>