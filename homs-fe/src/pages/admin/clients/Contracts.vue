<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons"
            :userRole="authStore.isAdmin" />
        <!-- 테이블 -->
        <DynamicTable :columns="userColumns" :items="contracts" :showCheckbox="false" :page="currentPage"
            :isLoading="isTableLoading" :pageSize="pageSize" @row-click="handleRowClick" uniqueKey="contractId">
            <template #cell-contractId="{ item }">
                <strong>{{ item.contractId }}</strong>
            </template>
            <template #cell-contractStartAt="{ item }">
                {{ new Date(item.contractStartAt).toISOString().split('T')[0] }}
            </template>
            <template #cell-contractStopAt="{ item }">
                {{ new Date(item.contractStopAt).toISOString().split('T')[0] }}
            </template>
            <!-- <template #actions="{ item }">
                <button @click="detailClient(item)"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
                    조회
                </button>
            </template> -->
        </DynamicTable>
        <!-- 페이지 네비 -->
        <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" @set-page="handleSetPage">
        </PageNav>
        <!-- 모달 -->

        <ContractDetail :visible="showModal" :contractId="Number(selectedId)" @close="showModal = false">
        </ContractDetail>

    </div>
</template>

<script setup>
import apiClient from '@/api';
import SearchBox from '@/components/common/SaerchBar.vue';
import DynamicTable from '@/components/common/DynamicTable.vue';
import PageNav from '@/components/common/PageNav.vue';
import ContractDetail from '@/components/common/modal/ContractDetail.vue';
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/states/auth';
import { useRouter ,useRoute} from 'vue-router';
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const authStore = useAuthStore();

const isTableLoading = ref(false); // 로딩 상태 관리

const showModal = ref(false); // 모달 상태 관리
const selectedId = ref(null); // 선택된 항목 ID

const router = useRouter();
const route = useRoute();

const contracts = ref([]); // 계약 목록 데이터 상태 관리


const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(0); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)

const searchQuery = ref(""); // 검색어
const selectOption = ref(""); // 검색 옵션

// ------- 검색바 --------
const handleSearch = (searchData) => {
  searchQuery.value = searchData.searchQuery;
  selectOption.value = searchData.selectOption;
  pageSize.value = searchData.pageSize;
  currentPage.value = 1;
  fetchData();
};

const handleSelectOption = ref([
  { value: "PRODUCT_NAME", label: "제품명" },
  { value: "COMPANY_NAME", label: "회사명" },
  { value: "CATEGORY_NAME", label: "분류" },
]);

const actionButtons = ref([
  {
    label: "계약 등록",
    color: "bg-orange-500 hover:bg-orange-700",
    action: () => router.push({ name: "ContractForm" }),
    allowedRoles: ["admin"] // 이 버튼은 'admin'만 볼 수 있음
  },
]);

// ------- 테이블 --------
const userColumns = ref([
  { label: '파트너사', key: 'companyName' },
  { label: '계약품목', key: 'productName' },
  { label: '계약시작일자', key: 'contractStartAt' },
  { label: '계약만료일자', key: 'contractStopAt' },
  { label: '분류', key: 'categoryName' },
]);

const client = ref([
    { id: 1, companyName: '영광상사', productName: '303', contractStartAt: '2025-02-10', contractStopAt: '2026-02-10', categoryName: 'LDPE'},
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
    for(const key in params){
        if (params[key] !== undefined && params[key] !== null && params[key] !== ''){
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    }

    // 브라우저 주소창 업데이트 (replaceState 사용)
    window.history.replaceState({}, '', url.toString())


    try {
        const response = await apiClient.get("/contract/", { params });
        if (response.status === 200) {
            console.log(response.data.data);
            contracts.value  = response.data.data.content; // 응답 데이터 할당
            totalPages.value = response.data.data.page.totalPages; // 총 페이지 수 할당
        } else {
            alert('데이터를 불러오는데 실패했습니다');
        }
    } catch (err) {
        console.error('데이터 요청 중 에러 발생:', err);
    }finally {
        isTableLoading.value = false; // 로딩 종료
    }
};

// const detailClient = (client) => {
//   console.log('거래처 상세조회:', client);  
//   console.log('거래처 id 정보', client.id);
//   console.log('거래처 회사명 조회', client.companyName);
// };

// 선택한 행에 대한 정보 처리
const handleRowClick = (item) => {
    selectedId.value = item.contractId; // 선택된 항목 ID 업데이트
    showModal.value = true;
};

// ------- 페이지네이션 --------
const handleSetPage = (page) => {
  currentPage.value = page;
  fetchData();
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
    // 모달 상태를 localstorage에 넣어서 상태 관리
    const modalConfirmed = localStorage.getItem("modalConfirmed");
    if (modalConfirmed === "true") {
        showModal.value = false;
    }
    fetchData();
});

</script>