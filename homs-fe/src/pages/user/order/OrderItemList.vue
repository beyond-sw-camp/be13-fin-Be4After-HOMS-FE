<template>
    <div>
        <!-- 제목 -->
        <div class="text-3xl px-3 py-3">
            <span>주문관리 > 주문목록 > 상세주문</span>
        </div>
        <!-- 배송 등 상세 정보 -->
        <div class="flex flex-wrap gap-x-8 gap-y-4 justify-between w-full pl-4 pr-4">
            <div class="flex flex-wrap gap-x-3 gap-y-4 w-full">
                <!-- 발주 번호 -->
                <div class="flex flex-col gap-1 w-full md:w-auto">
                    <label class="block text-gray-700 font-semibold">주문번호</label>
                    <label class="block text-gray-700 font-semibold">주문번호</label>
                    <div
                        class="w-fit aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-2 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
                        class="w-fit aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-2 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
                        {{ orders.orderCode || "-" }}
                    </div>
                </div>
                <!-- 납품위치 (고정) -->
                <div v-if="authStore.isAdmin || orders.approved" class="flex flex-col gap-1 w-full md:w-auto">
                    <div v-if="authStore.isAdmin || orders.approved" class="flex flex-col gap-1 w-full md:w-auto">
                        <label class="block text-gray-700 font-semibold">납품위치</label>
                        <div
                            class="w-fit aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-2 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
                            {{ "서울" || "-" }}
                        </div>
                    </div>

                    <!-- 주문날짜 -->
                    <div class="flex flex-col gap-1 w-full md:w-auto">
                        <label class="block text-gray-700 font-semibold">주문날짜</label>
                        <div
                            class="w-fit aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-2 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
                            {{ new Date(orders.orderDate).toLocaleDateString() || "-" }}
                        </div>
                    </div>
                    <!-- 납기일 (고정) -->
                    <div v-if="authStore.isAdmin || orders.approved" class=" flex flex-col gap-1 w-full md:w-auto">
                        <label class="block text-gray-700 font-semibold">납기일</label>
                        <div
                            class="w-fit aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-2 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
                            {{ new Date(orders.dueDate).toLocaleDateString() || "-" }}
                        </div>
                    </div>
                    <!-- 발주요청 버튼 (유저) -->
                    <div v-if="!permission" class="flex items-end ml-auto">
                        <button @click="orderRequest()"
                            class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm">발주요청</button>
                    </div>
                </div>
            </div>
            <!-- 검색바 -->
            <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons"
                :userRole="permission" />
            <!-- 엑셀 업로드 -->
            <input type="file" ref="excelFileInput" @change="excelUpload" style="display: none" accept=".xlsx, .xls" />

            <!-- 테이블 -->
            <DynamicTable :columns="userColumns" :items="products" :showCheckbox="true" :page="currentPage"
                :pageSize="pageSize" @selected="handleSelectedItems" @row-click="handleRowClick" uniqueKey="productId">
                <!-- 항목 상세 설정 -->
                <template #cell-productQuantity="{ item }">
                    <div v-if="item && item.productQuantity === null">데이터 없음</div>
                    <div v-else-if="item && item.productQuantity !== undefined && !item.isEditing">{{
                        item.productQuantity
                    }}</div>
                    <div v-else-if="item && item.productQuantity !== undefined && item.isEditing">
                        <input type="number"
                            class="rounded mr-2 border-1 border-gray-300 w-15 focus:border-orange-500 focus:outline-none"
                            min="1" max="9999" v-model.number="item.productQuantity" @click.stop @mousedown.stop />
                    </div>
                    <div v-else>데이터 오류</div>
                </template>
                <template #actions="{ item }">
                    <div v-if="!permission">
                        <button @click="editBtn(item)"
                            class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">
                            {{ item.isEditing ? "완료" : $t("btn.edit") }}
                        </button>
                        <button @click="deleteBtn(item.productId)"
                            class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
                            {{ $t("btn.del") }}
                        </button>
                    </div>
                    <!-- 주문 클레임 버튼 -->
                    <div v-if="claimPermission">
                        <button @click="claimBtn(item.productId)"
                            class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">교환</button>
                    </div>
                </template>
            </DynamicTable>

            <!-- 페이지 네비 -->
            <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" @set-page="handleSetPage">
            </PageNav>
            <!-- 제품 상세 모달 -->
            <ProductDetail :visible="showModal" :productId="Number(selectedId)" @close="showModal = false">
            </ProductDetail>
            <!-- 신청 모달 -->
            <OrderRequestModal :visible="showReqeustModal" :text="modalText" @update:visible="showReqeustModal = $event"
                @confirm="orderConfirm" @cancel="showReqeustModal = false" />
            <!-- 클레임 모달 -->
            <ClaimRequestModal :visible="showClaimModal" :text="modalText" @update:visible="showClaimModal = $event"
                @confirm="claimConfirm" @cancel="showClaimModal = false" />
        </div>
</template>

<script setup>
import apiClient from "@/api";
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import ProductDetail from "@/components/common/modal/ProductDetail.vue";
import OrderRequestModal from "@/components/common/modal/OrderRequestModal.vue";
import ClaimRequestModal from "@/components/common/modal/ClaimRequestModal.vue";
import ConfirmModal from "@/components/common/modal/ConfirmModal.vue";
import {ref, watch, onMounted, toRaw, onBeforeUnmount} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";
import {downloadBlob, getFilenameFromHeaders} from "@/utils/fileDownloader";

const authStore = useAuthStore();
const permission = ref(false);
const claimPermission = ref(false);

const {t, locale} = useI18n();
const selectedLang = ref(locale.value === "ko" ? "KOR" : "ENG");

const router = useRouter();
const route = useRoute();

const orderId = ref(route.query.orderId || "");

const showModal = ref(false); // 모달 상태 관리
const showReqeustModal = ref(false); // 발주 요청 모달 상태 관리
const showClaimModal = ref(false); // 클레임 모달 상태 관리
const selectedId = ref(null); // 선택된 항목 ID
const modalText = ref(""); // 모달 텍스트
const currentActionType = ref("");

// 알람 모달 관련
const showConfirmModal = ref(false); // 알람 모달 상태
const modalType = ref(""); // 알람 모달 식별 타입
const alertModal = ref(false); // 알람 모달 여부

const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(0); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)

const selectedUserIds = ref([]); // 선택된 항목 ID

const searchQuery = ref(""); // 검색어
const selectOption = ref(""); // 검색 옵션

// input 요소에 접근하기 위한 ref
const excelFileInput = ref(null);

// 버튼 클릭 시 파일 선택 다이얼로그를 띄우는 함수
const handleExcelUploadClick = () => {
    excelFileInput.value.click(); // 숨겨진 input 요소 클릭
};

// 배송 정보
const selectedDueDate = ref("");

// 발주 신청
const orderRequest = async () => {
    modalText.value = "납품위치와 납기일을 지정해주세요";
    currentActionType.value = "approve";
    showReqeustModal.value = true;
    console.log("orderId", orderId.value)
};

// 클레임 요청
const claimBtn = async (productId) => {
    selectedId.value = productId;
    modalText.value = "교환 요청 하시겠습니까?";
    currentActionType.value = "approve";
    showClaimModal.value = true;
};

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
    {value: "PRODUCT_NAME", label: "제품명"},
    {value: "DOMAIN_NAME", label: "분야"},
    {value: "CATEGORY_NAME", label: "분류"},
]);
// 액션 버튼 정의
const actionButtons = ref([
    {
        label: "주문목록",
        color: "bg-gray-500 hover:bg-gray-700",
        action: () => excelDown(),
        allowedRoles: ["admin", "user"],
    },
    {
        label: "엑셀주문",
        color: "bg-gray-500 hover:bg-gray-700",
        action: () => handleExcelUploadClick(),
        allowedRoles: ["user"],
    },
    {
        label: "추가주문",
        color: "bg-orange-500 hover:bg-orange-700",
        action: () => router.push({name: "UserProducts", query: {orderId: orderId.value}}),
        allowedRoles: ["user"],
    },
    {
        label: "일괄삭제",
        color: "bg-gray-500 hover:bg-gray-700",
        action: () => deleteItems(selectedUserIds),
        allowedRoles: ["user"],
    },
]);

// ------- 테이블 --------
const userColumns = ref([
    {label: "분야", key: "productDomain"},
    {label: "분류", key: "productCategory"},
    {label: "제품명", key: "productName"},
    {label: "최소단위", key: "productMinQuantity"},
    {label: "주문수량", key: "productQuantity"},
]);

const products = ref([
    {id: 1, categroy: "PO", categroy2: "LDPE", productName: "303", productMinQuantity: "10", inven: "9999"},
    {id: 2, categroy: "PO", categroy2: "LDPE", productName: "303", productMinQuantity: "10", inven: "9999"},
    {id: 3, categroy: "PO", categroy2: "LDPE", productName: "303", productMinQuantity: "10", inven: "9999"},
    {id: 4, categroy: "PO", categroy2: "LDPE", productName: "303", productMinQuantity: "10", inven: "9999"},
]);

const orders = ref([{}]);

// 수정 버튼
const editBtn = async (item) => {
    if (item) {
        item.isEditing = !item.isEditing;
        if (item.isEditing === false) {
            await apiClient.put(`/orderitem/${orders.value.orderId}/renew/${item.productId}?quantity=${item.productQuantity}`);
            
            alertModal.value = true;
            showConfirmModal.value = true;
            modalText.value = "수정되었습니다.";
        }
    }
};

// 주문 단일 취소
const deleteBtn = (productId) => {
    selectedId.value = productId;
    alertModal.value = false;
    showConfirmModal.value = true;
    modalText.value = t("script.delete");
    modalType.value = "orderCancle";
};

// 주문 일괄 취소
const deleteItems = async (selectedItems) => {
    if (selectedItems.value.length <= 0) {
        alertModal.value = true;
        showConfirmModal.value = true;
        modalText.value = "항목을 선택해주세요!";
    } else {
        alertModal.value = false;
        showConfirmModal.value = true;
        modalText.value = selectedUserIds.value.length + "개의 항목을 정말로 삭제하시겠습니까?";
        modalType.value = "orderCancles";   
    }
};

// 주문 취소 처리
const deletePostData = async (params) => {
    try {
        await apiClient.delete(`/orderitem/${orders.value.orderId}/out`, {
            params: {productIds: params}, // 리스트 데이터를 직접 전달
            // 쿼리 스트링 직접 변환
            paramsSerializer: (params) => {
                return params.productIds.map((id) => `productIds=${id}`).join("&"); // 배열을 올바르게 직렬화
            },
        });
        alertModal.value = true;
        showConfirmModal.value = true;
        modalText.value = "해당 상품의 주문이 취소되었습니다.";
        fetchData();
    } catch (error) {
        alertModal.value = true;
        showConfirmModal.value = true;
        modalText.value = error;
    }
};

// 알림 모달에서 확인이 눌러졌을 때
const confirmModal = async () => {
    const productId = selectedId.value;

    if (modalType.value === "orderCancle") {
        deletePostData([productId]);
    } else if (modalType.value === "orderCancles") {
        const rowSelectedItems = toRaw(selectedUserIds.value);
        deletePostData(rowSelectedItems);
    }
}

// 알림 모달에서 취소 눌렀을 때
const confirmModalCancle = () => {
    console.log("취소");
    selectedUserIds.value = [];
    showConfirmModal.value = false;
}

// 데이터 가져오는 함수
const fetchData = async () => {
    // 기본 요청 파라미터
    const params = {
        orderId: orderId.value,
        page: currentPage.value - 1, // 현재 페이지 번호 -1 (0 기반 인덱스)
        size: pageSize.value,
    };

    if (searchQuery.value && selectOption.value) {
        params.option = selectOption.value;
        params.keyword = searchQuery.value;
    }

    // 쿼리 파라미터 업데이트
    const url = new URL(window.location.origin + route.path);
    console.log(url);
    for (const key in params) {
        console.log(route.path);
        console.log(key);
        if (params[key] !== undefined && params[key] !== null && params[key] !== "") {
            url.searchParams.set(key, params[key]);
        } else {
            url.searchParams.delete(key);
        }
    }

    // 브라우저 주소창 업데이트 (replaceState 사용)
    window.history.replaceState({}, "", url.toString());

    try {
        const response = await apiClient.get(`/orderitem/${orderId.value}`, {params});
        if (response.status === 200) {
            console.log(response.data.message);
            console.log(response.data.data);
            products.value = response.data.data.content;
            orders.value = response.data.data.content[0];
            console.log(orders.value.orderStatus);
            if (orders.value.dueDate) {
                selectedDueDate.value = new Date(orders.value.dueDate).toISOString().split("T")[0];
            }

            totalPages.value = response.data.data.page.totalPages; // 총 페이지 수 할당

            // 검색바 권한 관리
            if (authStore.isAdmin) {
                permission.value = true;
            } else if (orders.value.approved || orders.value.rejectReason) {
                permission.value = true;
            }

            // 클레임 권한 관리
            if (authStore.isUser && orders.value.approved && orders.value.rejectReason === null) {
                console.log("클레임 가능");
                claimPermission.value = true;
            }
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
    }
};

// 선택한 행에 대한 정보 처리
const handleRowClick = (item) => {
    selectedId.value = item.productId; // 선택된 항목 ID 업데이트
    showModal.value = true;
};

// 엑셀 다운로드
const excelDown = async () => {
    try {
        const response = await apiClient.get(`/excel/download?type=ORDER&orderId=${orderId.value}`, {
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
        alert("파일 다운로드 실패");
    }
};

// 엑셀 업로드
const excelUpload = async (event) => {
    const file = event.target.files[0]; // 선택된 첫 번째 파일 가져오기

    if (!file) {
        console.warn("파일이 선택되지 않았습니다.");
        return;
    }

    // FormData 객체 생성: 파일을 서버로 보낼 때 사용합니다.
    const formData = new FormData();
    formData.append("file", file); // 'file'은 서버에서 파일을 받을 때 사용할 필드 이름입니다.
    // 필요한 경우 다른 데이터도 추가할 수 있습니다.
    // formData.append("orderId", orderId.value);

    try {
        const response = await apiClient.post(`/excel/upload?orderId=${orderId.value}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // 파일 업로드 시 필수 헤더
            },
        });

        console.log("파일 업로드 성공:", response.data);
        alert("엑셀 파일이 성공적으로 업로드되었습니다!");
    } catch (error) {
        console.error("파일 업로드 실패:", error);
        if (error.response) {
            console.error("서버 응답 데이터:", error.response.data);
            alert(`엑셀 파일 업로드 실패: ${error.response.data.message || error.message}`);
        } else {
            alert(`엑셀 파일 업로드 실패: ${error.message}`);
        }
    } finally {
        // 업로드 후 input 파일 선택을 초기화하여 같은 파일 재선택 가능하게 함
        event.target.value = "";
        fetchData();
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
    // 모달 상태를 localstorage에 넣어서 상태 관리
    const modalConfirmed = localStorage.getItem("modalConfirmed");
    if (modalConfirmed === "true") {
        showModal.value = false;
    }

    fetchData();
});

// 컴포넌트가 언마운트 되기전에 호출
onBeforeUnmount(async () => {
    // 사용자가 정보를 다 입력하지 않았다면 현재 주문 삭제
    // if (!selectedDueDate.value) {
    //     console.log("삭제");
    //     console.log(selectedDueDate.value);
    //     try {
    //         await apiClient.delete(`/order/${orderId.value}`);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
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
    // selectedUserIds.value.length
};

// 발주 신청 모달의 '확인' 버튼 클릭 시 호출되는 중앙 함수
async function orderConfirm(delivery, dueDate) {
    if (currentActionType.value === "approve") {
        try {
            const params = {
                dueDate: dueDate,
                // deliveryLocation: delivery,
            };
            await apiClient.put(`/order/${orderId.value}/date`, params);
            selectedDueDate.value = dueDate;

            confirm("발주 신청이 완료되었습니다.");

            router.push({name: "UserOrders"});
        } catch (error) {
            alertModal.value = true;
            showConfirmModal.value = true;
            modalText.value = error.response.data.message;
        }
    }
}

// 교환 신청 모달의 '확인' 버튼 클릭 시 호출되는 중앙 함수
async function claimConfirm(option, inputValue) {
    if (currentActionType.value === "approve") {
        try {
            const params = {
                orderId: orderId.value,
                productId: selectedId.value,
                reason: option,
                details: inputValue,
                status: "EXCHANGE",
            };
            await apiClient.post(`/claim/`, params);
            alert("신청이 완료되었습니다!");
            fetchData();
        } catch (error) {
            alert(error.response.data.message);
        }
    }
}

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) => {
    const langCode = newLang === "KOR" ? "ko" : "en";
    locale.value = langCode;
    localStorage.setItem("selectedLang", langCode);
});
</script>
