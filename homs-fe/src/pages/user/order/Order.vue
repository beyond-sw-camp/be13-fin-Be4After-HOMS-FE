<template>
    <div>
        <!-- 제목 -->
        <Breadcrumb />
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons"
            :userRole="authStore.isAdmin" />
        <!-- 엑셀 업로드 -->
        <input type="file" ref="excelFileInput" @change="excelUpload" style="display: none" accept=".xlsx, .xls" />
        <!-- 테이블 -->
        <DynamicTable :columns="orderColumns" :items="filteredOrders" :showCheckbox="false" :page="currentPage"
            :pageSize="pageSize" :isLoading="isTableLoading" @selected="handleSelectedItems" @row-click="handleRowClick"
            uniqueKey="orderId">
            <!-- 항목 상세 설정 -->
            <template #cell-orderDate="{ item }">
                {{ new Date(item.orderDate).toLocaleDateString() }}
            </template>
            <template #cell-dueDate="{ item }">
                <div v-if="item.dueDate === null" class="items-center text-center">-</div>
                <div v-else-if="item.dueDate !== null">{{ new Date(item.dueDate).toLocaleDateString() }}</div>
            </template>
            <template #cell-approved="{ item }">
                <p class=" text-base font-bold truncate text-green-700" v-if="item.approved === true">
                    승인
                </p>
                <p class=" text-base font-bold truncate text-red-600"
                    v-else-if="item.approved === false && item.rejectReason !== null">거부</p>
                <p class=" text-base font-bold truncate text-orange-400" v-else>미승인</p>
            </template>
            <template #cell-productQuantity="{ item }">
                <div v-if="item && item.productQuantity === null">-</div>
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
        <ConfirmModal :visible="showConfirmModal" :text="modalText" :type="modalType" :alert="alertModal"
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
import {downloadBlob, getFilenameFromHeaders} from "@/utils/fileDownloader";
import {ref, watch, onMounted, computed} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";
import Breadcrumb from "@/components/common/Breadcrumb.vue";

const authStore = useAuthStore();

const isTableLoading = ref(false); // 로딩 상태 관리

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
const alertModal = ref(false); // 알람 모달 여부

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

// 액션 버튼 정의
const actionButtons = ref([
{
        label: "엑셀양식",
        color: "bg-green-600 hover:bg-green-700",
        action: () => excelDown("TEMPLATE"),
        allowedRoles: ["user"],
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256"><g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M28.8125,0.03125l-28,5.3125c-0.47266,0.08984 -0.8125,0.51953 -0.8125,1v37.3125c0,0.48047 0.33984,0.91016 0.8125,1l28,5.3125c0.0625,0.01172 0.125,0.03125 0.1875,0.03125c0.23047,0 0.44531,-0.07031 0.625,-0.21875c0.23047,-0.19141 0.375,-0.48437 0.375,-0.78125v-48c0,-0.29687 -0.14453,-0.58984 -0.375,-0.78125c-0.23047,-0.19141 -0.51953,-0.24219 -0.8125,-0.1875zM32,6v7h2v2h-2v5h2v2h-2v5h2v2h-2v6h2v2h-2v7h15c1.10156,0 2,-0.89844 2,-2v-34c0,-1.10156 -0.89844,-2 -2,-2zM36,13h8v2h-8zM6.6875,15.6875h5.125l2.6875,5.59375c0.21094,0.44141 0.39844,0.98438 0.5625,1.59375h0.03125c0.10547,-0.36328 0.30859,-0.93359 0.59375,-1.65625l2.96875,-5.53125h4.6875l-5.59375,9.25l5.75,9.4375h-4.96875l-3.25,-6.09375c-0.12109,-0.22656 -0.24609,-0.64453 -0.375,-1.25h-0.03125c-0.0625,0.28516 -0.21094,0.73047 -0.4375,1.3125l-3.25,6.03125h-5l5.96875,-9.34375zM36,20h8v2h-8zM36,27h8v2h-8zM36,35h8v2h-8z"></path></g></g></svg>'
    },
    {
        label: "엑셀주문",
        color: "bg-green-600 hover:bg-green-700",
        action: () => handleExcelUploadClick(),
        allowedRoles: ["user"],
        iconSvg: '<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256"><g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M28.8125,0.03125l-28,5.3125c-0.47266,0.08984 -0.8125,0.51953 -0.8125,1v37.3125c0,0.48047 0.33984,0.91016 0.8125,1l28,5.3125c0.0625,0.01172 0.125,0.03125 0.1875,0.03125c0.23047,0 0.44531,-0.07031 0.625,-0.21875c0.23047,-0.19141 0.375,-0.48437 0.375,-0.78125v-48c0,-0.29687 -0.14453,-0.58984 -0.375,-0.78125c-0.23047,-0.19141 -0.51953,-0.24219 -0.8125,-0.1875zM32,6v7h2v2h-2v5h2v2h-2v5h2v2h-2v6h2v2h-2v7h15c1.10156,0 2,-0.89844 2,-2v-34c0,-1.10156 -0.89844,-2 -2,-2zM36,13h8v2h-8zM6.6875,15.6875h5.125l2.6875,5.59375c0.21094,0.44141 0.39844,0.98438 0.5625,1.59375h0.03125c0.10547,-0.36328 0.30859,-0.93359 0.59375,-1.65625l2.96875,-5.53125h4.6875l-5.59375,9.25l5.75,9.4375h-4.96875l-3.25,-6.09375c-0.12109,-0.22656 -0.24609,-0.64453 -0.375,-1.25h-0.03125c-0.0625,0.28516 -0.21094,0.73047 -0.4375,1.3125l-3.25,6.03125h-5l5.96875,-9.34375zM36,20h8v2h-8zM36,27h8v2h-8zM36,35h8v2h-8z"></path></g></g></svg>'
    },
    {
        label: "상품목록",
        color: "bg-orange-500 hover:bg-orange-700",
        action: () => router.push({name: "UserProducts"}),
        allowedRoles: ["admin", "user"],
    },
]);

// ------- 테이블 --------
const orderColumns = ref([
    {label: "주문번호", key: "orderCode"},
    {label: "거래처명", key: "companyName"},
    {label: "납품장소", key: "deliveryName"},
    {label: "요청일", key: "orderDate"},
    {label: "납기일", key: "dueDate"},
    {label: "승인상태", key: "approved"},
]);

const orders = ref([]);

// 승인
const approveOrder = (orderId) => {
    currentOrderId.value = orderId;
    modalText.value = "선택하신 주문을 승인하시겠습니까?";
    currentActionType.value = "approve";
    showTextAreaInput.value = false; // textarea 안보이게
    showModal.value = true;
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

        const emailType = isApproved ? "ORDER_CONFIRMATION" : "ORDER_CANCELLATION";
        const requestBody = {
            id: orderId,
            content: reason,
            emailType: emailType,
        };
        apiClient.post("/notify/email/", requestBody);
    } catch (error) {
        alert(error.response.data.message);
    }
    fetchData();
};

// 취소
const cancleBtn = async (orderId) => {
    currentOrderId.value = orderId;
    alertModal.value = false;
    showConfirmModal.value = true;
    modalText.value = "주문을 취소하시겠습니까?";
    modalType.value = "orderCancle";
};

// 사유 확인
const rejectReasonView = async (orderId) => {
    try {
        const response = await apiClient.get(`/order/${orderId}`);
        if (response.status === 200) {
            alertModal.value = true;
            showConfirmModal.value = true;
            modalText.value = `
                <strong style="font-size: 1.1em; color: #333;">상세 사유</strong>
                <p style="margin-top: 8px; margin-bottom: 0; line-height: 1.5;">${response.data.data.rejectReason}</p>
            `;
        } else {
            alertModal.value = true;
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

            alertModal.value = true;
            showConfirmModal.value = true;
            modalText.value = "주문이 취소되었습니다.";

            fetchData();
        } catch (error) {
            alertModal.value = true;
            showConfirmModal.value = true;
            modalText.value = error.response.data.message;
        }
    }
};

// DynamicTable에 전달할 필터링된 주문 목록
const filteredOrders = computed(() => {
    // 관리자는 발주요청되지 않은 주문은 못봄
    if(authStore.isAdmin) {
        return orders.value.filter(item => {
            return !(item.deliveryName === null && item.dueDate === null);
        });
    } else{
        return orders.value;
    }
});

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
    } finally {
        isTableLoading.value = false; // 로딩 종료
    }
};

// 선택한 행에 대한 정보 처리
const handleRowClick = (item) => {
    console.log("선택된 행:", item.orderId);
    router.push({name: "OrderItemList", query: {orderId: item.orderId}});
};

// 엑셀 다운로드
const excelDown = async (type) => {
    try {
        const response = await apiClient.get(`/excel/download?type=${type}`, {
            responseType: "blob",
        });

        // 파일 이름 파싱
        const filename = getFilenameFromHeaders(response.headers);

        // Blob 데이터 생성
        const blob = new Blob([response.data], {type: response.headers["content-type"] || "application/octet-stream"});

        // 파일 다운로드
        downloadBlob(blob, filename);
    } catch (error) {
        console.error("파일 다운로드 실패:", error);
        alertModal.value = true;
        showConfirmModal.value = true;
        modalText.value = "파일 다운로드 실패";
    }
};

// input 요소에 접근하기 위한 ref
const excelFileInput = ref(null);

// 버튼 클릭 시 파일 선택 다이얼로그를 띄우는 함수
const handleExcelUploadClick = () => {
    excelFileInput.value.click(); // 숨겨진 input 요소 클릭
};

// 엑셀 업로드
const excelUpload = async (event) => {
    const file = event.target.files[0]; // 선택된 첫 번째 파일 가져오기

    if (!file) {
        console.warn("파일이 선택되지 않았습니다.");
        return;
    }

    if (!currentOrderId.value) {
        if (confirm("새로운 주문목록을 생성하시겠습니까?")) {
            const order = await apiClient.post("/order/");
            currentOrderId.value = order.data.data.orderId;
        } else {
            // 취소를 눌렀을 때 종료되도록 설정
            return 0;
        }
    }

    // FormData 객체 생성: 파일을 서버로 보낼 때 사용합니다.
    const formData = new FormData();
    formData.append("file", file); // 'file'은 서버에서 파일을 받을 때 사용할 필드 이름입니다.
    // 필요한 경우 다른 데이터도 추가할 수 있습니다.
    // formData.append("orderId", orderId.value);

    try {
        const response = await apiClient.post(`/excel/upload?orderId=${currentOrderId.value}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // 파일 업로드 시 필수 헤더
            },
        });

        console.log("파일 업로드 성공:", response.data);
        alert("엑셀 파일이 성공적으로 업로드되었습니다!");
        router.push({name: "OrderItemList", query: {orderId: currentOrderId.value}});
    } catch (error) {
        console.error("파일 업로드 실패:", error);
        if (error.response) {
            console.error("서버 응답 데이터:", error.response.data);
            alert(`엑셀 파일 업로드 실패: ${error.response.data.message || error.message}`);
        } else {
            alert(`엑셀 파일 업로드 실패: ${error.message}`);
        }
    }
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
async function approvedConfirmModal(inputValue) {
    const orderId = currentOrderId.value;
    showModal.value = false;
    const now = new Date().toISOString();

    const payload = {
        orderId: orderId,
        settlementDate: now,
        texInvoice: `invoce${orderId}`,
        isSettled: "UNSETTLED",
    };

    if (currentActionType.value === "approve") {
        await apiClient.post(`settlement/${orderId}`, payload);
        setApprove(currentOrderId.value, true, null);
        console.log("확인");
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
