<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons" :userRole="authStore.isAdmin" />
        <!-- 테이블 -->
        <DynamicTable :columns="userColumns" :items="users" :showCheckbox="false" :page="currentPage" :pageSize="pageSize" :isLoading="isTableLoading">
            <template #actions="{item}">
                <button @click="editUser(item)" class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">조회</button>
                <button @click="deleteUser(item)" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">삭제</button>
            </template>
        </DynamicTable>
        <!-- 페이지 네비 -->
        <PageNav :currentPage="currentPage" :totalPages="totalPages" @set-page="handleSetPage"></PageNav>
        <UserRegisterModal :visible="showRegisterModal" @close="showRegisterModal = false" />
    </div>
</template>

<script setup>
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import Breadcrumb from "@/components/common/Breadcrumb.vue";

import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import apiClient from "@/api";
import {useAuthStore} from "@/states/auth";
import UserRegisterModal from "@/components/common/modal/UserRegisterModal.vue";

const isTableLoading = ref(false); // 로딩 상태 관리
const router = useRouter();
const authStore = useAuthStore();
const searchResult = ref(null);
const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(1); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)
const showRegisterModal = ref(false);
const currentUserRole = ref("admin"); // 현재 유저 권한

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
        label: "신규 계정 생성",
        color: "bg-orange-500 hover:bg-orange-700",
        action: () => {
            showRegisterModal.value = true;
        },
        allowedRoles: ["admin"], // 이 버튼은 'admin' 또는 'editor'만 볼 수 있음
    },
]);

// ------- 테이블 --------
const userColumns = ref([
    {label: "이름", key: "userName"},
    {label: "파트너사", key: "companyName"},
    {label: "담당", key: "deptName"},
    {label: "이메일", key: "email"},
    {label: "권한", key: "role"},
    {label: "계정상태", key: "isLockedOut"},
    // { label: '최종 접속일', key: 'loginDate' },
]);

const deptNameMap = {
    SALES: "영업",
    BUY: "구매",
    DELIVERY: "배송",
    MATERIALS: "자재",
};

const users = ref([]);

const getApiPath = (basePath) => {
    return authStore.isAdmin ? `/admin${basePath}` : basePath;
};

const userData = async () => {
    isTableLoading.value = true;
    const response = await apiClient.get("/admin/user");
    const data = response.data.data;
    console.log("data: ", data);
    console.log("authStore", authStore);

    const filteredData = data.filter((item) => item.deleteAt === null);

    filteredData.sort((a, b) => b.userId - a.userId);


    const usersWithCompanyName = filteredData.map((item) => ({
        id: item.userId,
        userName: item.managerName,
        companyName: item.companyName,
        deptName: deptNameMap[item.deptName] || item.deptName,
        email: item.managerEmail,
        role: item.userRole === "ROLE_USER" ? "사용자" : "관리자",
        isLockedOut: item.isLockedOut ? "비활성화" : "활성화",
        // loginDate: "-",
    }));

    users.value = usersWithCompanyName;
    isTableLoading.value = false; // 로딩 종료
};

// 신규 계정 등록 API 추가
// const createUser = async () => {
//     const
// }

const editUser = (user) => {
    console.log("수정:", user.id);
    router.push({name: "AccountDetail", params: {id: user.id}});
};

const deleteUser = async (user) => {
    console.log("삭제:", user);
    try {
        await apiClient.delete(getApiPath(`/user/${user.id}`));
        alert("사용자가 삭제 되었습니다.");
        await userData();
    } catch (error) {
        alert("삭제 실패 하였습니다.", error);
    }
};

// ------- 페이지네이션 --------
const handleSetPage = (page) => {
    console.log("페이지 변경 요청:", page);
    currentPage.value = page;
    // 여기서 해당 페이지의 데이터를 불러오는 로직 등을 수행해야 합니다.
};

onMounted(() => {
    userData();
});
</script>
