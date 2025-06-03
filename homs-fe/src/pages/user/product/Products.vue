<template>
    <div>
        <!-- 제목 -->
        <div class="text-3xl px-3 py-3">
            <span>상품관리 > 상품목록</span>
        </div>
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons"
            :userRole="authStore.isAdmin" />
        <!-- 엑셀 업로드 -->
        <input type="file" ref="excelFileInput" @change="excelUpload" style="display: none" accept=".xlsx, .xls" />
        <!-- 테이블 -->
        <DynamicTable :columns="userColumns" :items="products" :showCheckbox="true" :page="currentPage"
            :pageSize="pageSize" @selected="handleSelectedItems" @row-click="handleRowClick" uniqueKey="productId">
            <!-- 항목 상세 설정 -->
            <template #cell-productId="{ item }">
                <strong>{{ item.productId }}</strong>
            </template>
            <template #cell-category="{ item }">
                {{ item.category?.categoryId }}
            </template>
            <template #cell-productDomain="{ item }">
                {{ item.category?.productDomain }}
            </template>
            <template #cell-productCategory="{ item }">
                {{ item.category?.productCategory }}
            </template>
            <template #cell-productQuantity="{ item }">
                <div v-if="item && item.productQuantity === null">데이터 없음</div>
                <div v-else-if="item && item.productQuantity !== undefined">
                    {{ item.productQuantity }}
                </div>
                <div v-else>데이터 오류</div>
            </template>
            <template #actions="{ item }">
                <div v-if="authStore.isAdmin">
                    <button @click="editBtn(item.productId)"
                        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">
                        {{ $t("btn.edit") }}
                    </button>
                    <button @click="deleteBtn(item.productId)"
                        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm">
                        {{ $t("btn.del") }}
                    </button>
                </div>
                <div v-else>
                    <input type="number"
                        class="rounded mr-2 border-1 border-gray-300 w-24 focus:border-orange-500 focus:outline-none"
                        min="1" max="9999" v-model.number="item.quantityToOrder" @mousedown.stop />
                    <button @click="orderBtn(item.productId, item.quantityToOrder)"
                        class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2">발주
                        추가</button>
                </div>
            </template>
        </DynamicTable>

        <!-- 페이지 네비 -->
        <PageNav :currentPage="Number(currentPage)" :totalPages="Number(totalPages)" @set-page="handleSetPage">
        </PageNav>
        <!-- 상품 상세 모달 -->
        <ProductDetail :visible="showModal" :productId="Number(selectedId)" @close="showModal = false"></ProductDetail>
        <!-- 알림 모달 -->
        <ConfirmModal :visible="showConfirmModal" :text="modalText" :type="modalType" :alert="alert"
            @update:visible="showConfirmModal = $event" @confirm="confirmModal" @cancle="confirmModalCancle">
        </ConfirmModal>
    </div>
</template>

<script setup>
import apiClient from "@/api";
import SearchBox from "@/components/common/SaerchBar.vue";
import DynamicTable from "@/components/common/DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import ProductDetail from "@/components/common/modal/ProductDetail.vue";
import ConfirmModal from "@/components/common/modal/ConfirmModal.vue";
import {ref, watch, onMounted, toRaw} from "vue";
import {useRouter, useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import {useAuthStore} from "@/states/auth";
import {downloadBlob, getFilenameFromHeaders} from "@/utils/fileDownloader";

const authStore = useAuthStore();

const {t, locale} = useI18n();
const selectedLang = ref(locale.value === "ko" ? "KOR" : "ENG");

const router = useRouter();
const route = useRoute();

const orderId = ref(route.query.orderId || ""); // 추가 주문 여부

const showModal = ref(false); // 모달 상태 관리
const selectedId = ref(null); // 선택된 항목 ID

const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(0); // 총 페이지 수 상태 관리
const pageSize = ref(10); // 페이지당 항목 수 (고정값)

const selectedProductId = ref([]); // 선택된 항목 ID

const searchQuery = ref(""); // 검색어
const selectOption = ref(""); // 검색 옵션

// 알람 모달 관련
const showConfirmModal = ref(false); // 알람 모달 상태
const modalText = ref(""); // 알람 모달 텍스트
const modalType = ref(""); // 알람 모달 식별 타입
const alert = ref(false); // 알람 모달 여부

// input 요소에 접근하기 위한 ref
const excelFileInput = ref(null);

// 버튼 클릭 시 파일 선택 다이얼로그를 띄우는 함수
const handleExcelUploadClick = () => {
    excelFileInput.value.click(); // 숨겨진 input 요소 클릭
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
    {value: "productName", label: "제품명"},
    {value: "productDomain", label: "분야"},
    {value: "productCategory", label: "분류"},
]);
// 액션 버튼 정의
const actionButtons = ref([
    // 이 버튼은 'admin'만 볼 수 있음
    {
        label: t("btn.add"),
        color: "bg-orange-500 hover:bg-orange-700",
        action: () => router.push({name: "ProductForm"}),
        allowedRoles: ["admin"],
    },
    {
        label: "전체목록",
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
        label: "일괄추가",
        color: "bg-orange-500 hover:bg-orange-700",
        action: () => addItems(selectedProductId.value),
        allowedRoles: ["user"],
    },
    {
        label: "엑셀다운",
        color: "bg-gray-500 hover:bg-gray-700",
        action: () => orderListBtn(),
        allowedRoles: ["user"],
    },
]);

// ------- 테이블 --------
const userColumns = ref([
    {label: "분야", key: "productDomain"},
    {label: "분류", key: "productCategory"},
    {label: "제품명", key: "productName"},
    {label: "최소단위", key: "productMinQuantity"},
    {label: "재고량", key: "productQuantity"},
]);

const products = ref([
    {id: 1, categroy: "PO", categroy2: "LDPE", productName: "303", productMinQuantity: "10", inven: "9999"},
    {id: 2, categroy: "PO", categroy2: "LDPE", productName: "303", productMinQuantity: "10", inven: "9999"},
    {id: 3, categroy: "PO", categroy2: "LDPE", productName: "303", productMinQuantity: "10", inven: "9999"},
    {id: 4, categroy: "PO", categroy2: "LDPE", productName: "303", productMinQuantity: "10", inven: "9999"},
]);

// 개별 추가
const orderBtn = async (productId, quantity) => {
    selectedProductId.value.push({
        productId: productId,
        quantity: quantity,
    });
    alert.value = false;
    showConfirmModal.value = true;
    modalText.value = "상품을 주문목록에 추가하시겠습니까?";
    modalType.value = "singleCreateOrder";
};

// 일괄 추가
const addItems = async (selectedItem) => {
    console.log(selectedItem);
    if (selectedItem.length <= 0) {
        alert.value = true;
        showConfirmModal.value = true;
        modalText.value = "항목을 선택해주세요!";

    } else {
        selectedProductId.value = selectedItem;
        alert.value = false;
        showConfirmModal.value = true;
        modalText.value = selectedItem.length + "개의 항목을 추가하시겠습니까?";
        modalType.value = "multiCreateOrder";
    }
};

// 주문한 아이템을 저장하는 메서드
const orderItemPost = async (orderId, params) => {
    if (!orderId.value) {
        const order = await apiClient.post("/order/");
        orderId.value = order.data.data.orderId;
    }

    // toRaw를 사용하여 원본 자바스크립트 객체로 변환
    const rawParams = toRaw(params);
    await apiClient.post(`/orderitem/${orderId.value}`, rawParams);
    router.push({name: "OrderItemList", query: {orderId: orderId.value}});
};

const editBtn = (productId) => {
    router.push({name: "ProductForm", query: {productId: productId}});
};

// 삭제 버튼
const deleteBtn = (productId) => {
    selectedId.value = productId;
    showConfirmModal.value = true;
    modalText.value = "선택하신 상품을 삭제하시겠습니까?";
    modalType.value = "delete";
};

// 상품 삭제
const deletePostData = async (productId) => {
    try {
        const response = await apiClient.get(`/product/files/${productId}`);
        const files = response.data.data;
        console.log(files);
        // 반복문으로 files에서 key값을 기준으로 value를 가져옴
        Object.keys(files).forEach(async (key) => {
            const value = files[key];
            if (value !== null && value !== undefined && value !== "") {
                // s3로 시작하는 key값의 value를 가져옴
                if (key.startsWith("s3")) {
                    await apiClient.delete(`/files/delete?key=${value}`);
                }
            }
        });
        // DB에 저장된 파일명을 지움
        const response2 = await apiClient.delete(`/product/files/${productId}`);
        console.log(response2.data);
    } catch (error) {
        console.log("파일이 없습니다.");
    }

    try {
        await apiClient.delete(`/product/${productId}`);
        router.push("/products/");
        fetchData();
    } catch (error) {
        alert(error.response.data.message);
    }
};

// 알림 모달에서 확인이 눌러졌을때
const confirmModal = async () => {
    console.log("확인");
    if (modalType.value === "delete") {
        deletePostData(selectedId.value);
    } else if(modalType.value === "multiCreateOrder") {
        const selectedProductIds = ref([]);

        // 반복문으로 Id값을 비교하여 개수 가져와 할당
        selectedProductId.value.forEach((selectedItem) => {
            console.log(selectedItem);
            const foundProduct = products.value.find((product) => product.productId === selectedItem);
            if (foundProduct) {
                selectedProductIds.value.push({
                    productId: foundProduct.productId,
                    quantity: foundProduct.quantityToOrder,
                });
            }
            orderItemPost(orderId, selectedProductIds.value);
        });
    } else if (modalType.value === "singleCreateOrder") {
        orderItemPost(orderId, selectedProductId.value);
    }
}

// 알림 모달에서 취소 눌렀을 때
const confirmModalCancle = () => {
    console.log("취소");
    selectedProductId.value = [];
    selectedId.value = null;
    showConfirmModal.value = false;
}

// 엑셀 다운로드
const excelDown = async () => {
    try {
        const response = await apiClient.get(`/excel/download?type=ALL`, {
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

    if (!orderId.value) {
        if (confirm("새로운 주문목록을 생성하시겠습니까?")) {
            const order = await apiClient.post("/order/");
            orderId.value = order.data.data.orderId;
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
        const response = await apiClient.post(`/excel/upload?orderId=${orderId.value}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data", // 파일 업로드 시 필수 헤더
            },
        });

        console.log("파일 업로드 성공:", response.data);
        alert("엑셀 파일이 성공적으로 업로드되었습니다!");
        router.push({name: "OrderItemList", query: {orderId: orderId.value}});
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

// 데이터 가져오는 함수
const fetchData = async () => {
    // 기본 요청 파라미터
    const params = {
        page: currentPage.value - 1, // 현재 페이지 번호 -1 (0 기반 인덱스)
        size: pageSize.value,
    };

    if (searchQuery.value && selectOption.value) {
        // selectOption 값이 key가 되고, searchQuery는 value가 됩니다.
        params[selectOption.value] = searchQuery.value;
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
        const response = await apiClient.get("/product/", {params});
        if (response.status === 200) {
            console.log(response.data.data);
            products.value = response.data.data.content.map((item) => ({
                ...item, // 기존 item의 모든 속성을 복사
                quantityToOrder: 1, // 각 상품마다 고유한 quantityToOrder 속성 추가 (기본값 1)
            })); // 응답 데이터 할당
            totalPages.value = response.data.data.page.totalPages; // 총 페이지 수 할당
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

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(() => {
    const query = route.query;
    const queryPage = route.query.page;
    const querySize = route.query.size;

    if (queryPage) {
        currentPage.value = parseInt(queryPage) + 1;
    }
    if (querySize) {
        pageSize.value = parseInt(querySize);
    }
    console.log(query);
    if (query.productName) {
        selectOption.value = "productName";
        searchQuery.value = query.productName;
    } else if (query.productDomain) {
        selectOption.value = "productDomain";
        searchQuery.value = query.productDomain;
    } else if (query.productCategory) {
        selectOption.value = "productCategory";
        searchQuery.value = query.productCategory;
    }

    // 모달 상태를 localstorage에 넣어서 상태 관리
    const modalConfirmed = localStorage.getItem("modalConfirmed");
    if (modalConfirmed === "true") {
        showModal.value = false;
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
    selectedProductId.value = selectedIds;
    console.log("선택된 아이템 ID:", selectedProductId.value);
};

// 주문 목록
const orderListBtn = () => {
    if (orderId.value) {
        router.push({name: "OrderItemList", query: {orderId: orderId.value}});
    } else router.push({name: "UserOrders"});
};

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) => {
    const langCode = newLang === "KOR" ? "ko" : "en";
    locale.value = langCode;
    localStorage.setItem("selectedLang", langCode);
});
</script>
