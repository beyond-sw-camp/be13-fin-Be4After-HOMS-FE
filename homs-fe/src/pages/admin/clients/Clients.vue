<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons" :userRole="currentUserRole" />
        <!-- 테이블 -->
        <DynamicTable @row-click="detailClient" :columns="userColumns" :items="client" :showCheckbox="true" :page="currentPage" :pageSize="pageSize" :isLoading="isTableLoading">
            <template #actions="{item}">
                <button
                    @click="changeGrantState(item)"
                    :class="
                        item.isApprove === 'Y'
                            ? 'bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm'
                            : 'bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm'
                    "
                >
                    {{ item.isApprove === "Y" ? "승인 취소" : "승인" }}
                </button>
                <button
                    @click="changeContractState(item)"
                    :class="
                        item.isContract === 'Y'
                            ? 'bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm ml-2'
                            : 'bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm ml-2'
                    "
                >
                    {{ item.isContract === "Y" ? "거래 취소" : "거래 재개" }}
                </button>
            </template>
        </DynamicTable>
        <!-- 페이지 네비 -->
        <PageNav :currentPage="currentPage" :totalPages="totalPages" @set-page="handleSetPage"></PageNav>
    </div>
</template>

<script setup>
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import {onMounted, ref} from "vue";
import apiClient from "@/api";
import {useRouter} from "vue-router";
import Breadcrumb from "@/components/common/Breadcrumb.vue";

const isTableLoading = ref(false); // 로딩 상태 관리

const searchResult = ref(null);
const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(1); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)
const currentUserRole = ref("admin"); // 현재 유저 권한
const router = useRouter();

// ------- 검색바 --------
const handleSearch = (searchData) => {
    console.log("검색 데이터:", searchData);
    // 여기서 검색 로직을 처리하거나 부모 컴포넌트로 데이터를 전달할 수 있습니다.
    searchResult.value = searchData;
};

const handleSelectOption = ref([
    {value: "", label: "전체"},
    {value: "important", label: "중요"},
    {value: "recent", label: "최근"},
]);

const actionButtons = ref([
    {
        label: "추가",
        color: "bg-orange-500 hover:bg-orange-700",
        action: (item) => console.log("추가:", item),
        allowedRoles: ["admin", "editor"], // 이 버튼은 'admin' 또는 'editor'만 볼 수 있음
    },
    {
        label: "일괄제거",
        color: "bg-gray-500 hover:bg-gray-700",
        action: (item) => console.log("삭제:", item),
        allowedRoles: ["admin"], // 이 버튼은 'admin'만 볼 수 있음
    },
]);

// ------- 테이블 --------
const userColumns = ref([
    {label: "회사명", key: "companyName"},
    {label: "대표자명", key: "ceoName"},
    {label: "거래 진행 여부", key: "isContract"},
    {label: "승인 여부", key: "isApprove"},
]);

const client = ref([]);

const fetchData = async () => {
    isTableLoading.value = true;
    const response = await apiClient.get("admin/company");
    const data = response.data.data;
    console.log("거래처 데이터 받아오기", data);
    client.value = data.map((item, index) => ({
        id: item.companyId,
        companyName: item.companyName,
        ceoName: item.representName,
        isContract: item.continueStatus ? "Y" : "N",
        isApprove: item.approvedStatus ? "Y" : "N", // 백엔드 수정 요청
    }));
    isTableLoading.value = false; // 로딩 종료
};

const detailClient = (client) => {
    console.log("거래처 회사명 조회", client.companyName);
    router.push({name: "ClientDetail", params: {id: client.id}});
};

// 거래처 승인 함수
const changeGrantState = async (client) => {
    console.log("client.id", client.id);
    const newStatus = client.isApprove === "Y" ? false : true;
    console.log(newStatus);

    const response = await apiClient.put(`admin/company/grant/${client.id}`, {
        isApprovedStatus: newStatus,
        // isApprovedStatus: true
    });

    console.log("상태 변경 결과:", response.data);

    alert(client.isApprove === "Y" ? `"${client.companyName}"의 승인이 취소되었습니다.` : `"${client.companyName}"이 승인되었습니다.`);
    await fetchData();
};

// 거래처 거래 상태 바꾸기
const changeContractState = async (client) => {
    console.log("client.id", client.id);
    const newStatus = client.isContract === "Y" ? false : true;
    console.log(newStatus);

    const response = await apiClient.put(`admin/company/status/${client.id}`, {
        isApprovedStatus: newStatus,
    });

    console.log("상태 변경 결과:", response.data);

    alert(client.isContract === "Y" ? `"${client.companyName}"의 거래가 중지되었습니다.` : `"${client.companyName}"의 거래가 재개되었습니다.`);
    await fetchData();
};

// ------- 페이지네이션 --------
const handleSetPage = (page) => {
    console.log("페이지 변경 요청:", page);
    currentPage.value = page;
    // 여기서 해당 페이지의 데이터를 불러오는 로직 등을 수행해야 합니다.
};

onMounted(() => {
    fetchData();
});
</script>
