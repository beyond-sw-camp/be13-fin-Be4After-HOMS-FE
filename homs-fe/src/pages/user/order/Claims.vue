<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :userRole="authStore.isAdmin" />
        <!-- 테이블 -->
        <DynamicTable :columns="orderColumns" :items="orders" :showCheckbox="false" :page="currentPage"
            :pageSize="pageSize" :isLoading="isTableLoading" @selected="handleSelectedItems" @row-click="handleRowClick"
            uniqueKey="orderId">
            <!-- 항목 상세 설정 -->
            <template #cell-orderDate="{ item }">
                {{ new Date(item.orderDate).toISOString().split('T')[0] }}
            </template>
            <template #cell-dueDate="{ item }">
                {{ new Date(item.dueDate).toISOString().split('T')[0] }}
            </template>
            <template #cell-allClaimsRejected="{ item }">
                <strong class="text-green-500" v-if="item.allClaimsRejected === true">완료</strong>
                <strong class="text-red-500" v-else>진행중</strong>
            </template>
        </DynamicTable>

        <!-- 페이지 네비 -->
        <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" @set-page="handleSetPage">
        </PageNav>
    </div>
</template>

<script setup>
import apiClient from "@/api";
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import {ref, watch, onMounted} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";
import Breadcrumb from '@/components/common/Breadcrumb.vue';
import { useClaimStore } from "@/states/claim";

const authStore = useAuthStore();
const claimStore = useClaimStore();

const isTableLoading = ref(false); // 로딩 상태 관리

const {t, locale} = useI18n();
const selectedLang = ref(locale.value === "ko" ? "KOR" : "ENG");

const router = useRouter();
const route = useRoute();

const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(0); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)

const selectedUserIds = ref([]); // 선택된 항목 ID

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
const handleSelectOption = ref([
    {value: "ORDER_CODE", label: "주문번호"},
    {value: "COMPANY_NAME", label: "거래처명"},
]);

// ------- 테이블 --------
const orderColumns = ref([
    {label: "주문번호", key: "orderCode"},
    {label: "거래처명", key: "companyName"},
    {label: "요청일", key: "orderDate"},
    {label: "납기일", key: "dueDate"},
    {label: "클레임 상태", key: "allClaimsRejected"},
]);

const orders = ref([]);

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
        const response = await apiClient.get("/claim/", {
            params: params, // 여기에 구성한 파라미터 객체를 전달합니다.
        });
        if (response.status === 200) {
            const content = response.data.data.content;
            orders.value = content;
            totalPages.value = response.data.data.page.totalPages; // 총 페이지 수 할당

            console.log("orders.value", orders.value)

            const summary = {
                cancel: content.filter(order => order.claimStatus === 'CANCEL').length,
                complete: content.filter(order => order.claimStatus === 'COMPLETE').length,
                exchange: content.filter(order => order.claimStatus === 'EXCHANGE').length,
            };
            console.log("summary+++++",summary);

            claimStore.updateSummary(summary);
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
    } finally {
        isTableLoading.value = false; // 로딩 종료
    }
};

// 선택한 행에 대한 정보 처리
const handleRowClick = (item) => {
    console.log("선택된 행:", item.orderId);
    router.push({name: "ClaimItem", params: {orderId: item.orderId}});
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

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) => {
    const langCode = newLang === "KOR" ? "ko" : "en";
    locale.value = langCode;
    localStorage.setItem("selectedLang", langCode);
});
</script>
