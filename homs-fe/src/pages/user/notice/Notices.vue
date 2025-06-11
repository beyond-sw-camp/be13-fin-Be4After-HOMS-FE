<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />

        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons" :userRole="authStore.isAdmin" />
        <!-- 테이블 -->
        <DynamicTable
            :columns="userColumns"
            :items="users"
            :showCheckbox="false"
            :page="currentPage"
            :pageSize="pageSize"
            :isLoading="isTableLoading"
            @selected="handleSelectedItems"
            @row-click="handleRowClick"
            :column-classes="{
                title: 'text-start font-semibold text-gray-700',
                createdAt: 'text-start text-sm text-gray-500',
                id: 'text-start',
            }"
        >
            <!-- 항목 상세 설정 -->
            <template #cell-id="{item}">
                <strong>{{ item.id }}</strong>
            </template>
            <template #cell-createdAt="{item}">
                {{ item.createdAt.split("T")[0] }}
            </template>
        </DynamicTable>

        <!-- 페이지 네비 -->
        <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" @set-page="handleSetPage"> </PageNav>
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
import Breadcrumb from "@/components/common/Breadcrumb.vue";

const authStore = useAuthStore();

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
// const selectOption = ref(''); // 검색 옵션

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) => {
    const langCode = newLang === "KOR" ? "ko" : "en";
    locale.value = langCode;
    localStorage.setItem("selectedLang", langCode);
});

// ------- 검색바 --------
const handleSearch = (searchData) => {
    searchQuery.value = searchData.searchQuery;
    pageSize.value = searchData.size;
    currentPage.value = 1;
    fetchData();
};
// 검색 필터 목록
const handleSelectOption = ref([
    {value: "", label: "전체"},
    // { value: 'TITLE', label: '제목' },
    // { value: 'CONTENT', label: '내용' },
]);
// 액션 버튼 정의
const actionButtons = ref([
    {
        label: t("btn.add"),
        color: "bg-orange-500 hover:bg-orange-700",
        action: () => router.push({name: "AdminNoticesFrom"}),
        allowedRoles: ["admin"], // 이 버튼은 'admin'만 볼 수 있음
    },
]);

// ------- 테이블 --------
const userColumns = ref([
    {label: "제목", key: "title"},
    {label: "등록일", key: "createdAt"},
]);

// 샘플 데이터
const users = ref([]);

// 데이터 가져오는 함수
const fetchData = async () => {
    isTableLoading.value = true;
    // 기본 요청 파라미터
    const params = {
        page: currentPage.value - 1, // 현재 페이지 번호 -1 (0 기반 인덱스)
        size: pageSize.value,
        sort: "id,desc", // 정렬 기준 명시
    };

    if (searchQuery.value) {
        params.title = searchQuery.value;
    }

    // 쿼리 파라미터 업데이트
    const url = new URL(window.location.origin + route.path); // 현재 경로 기반 URL 생성
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
        const response = await apiClient.get("/notice/", {params});
        if (response.status === 200) {
            console.log(response.data.data);
            users.value = response.data.data.content; // 응답 데이터 할당
            totalPages.value = response.data.data.page.totalPages; // 총 페이지 수 할당
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
    router.push({name: "UserNoticesDetail", params: {id: item.id}});
};

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

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(() => {
    // URL에서 쿼리 파라미터를 읽어와서 상태 초기화
    const queryPage = route.query.page;
    const querySize = route.query.size;
    const queryTitle = route.query.title;

    if (queryPage) {
        currentPage.value = parseInt(queryPage) + 1;
    }
    if (querySize) {
        pageSize.value = parseInt(querySize);
    }
    if (queryTitle) {
        searchQuery.value = queryTitle;
    }

    fetchData();
});
</script>
