<template>
    <div v-if="visible" class="fixed inset-0 z-120 flex items-center justify-center">
        <div class="absolute inset-0 bg-gray-900 opacity-60"></div>

        <!-- 모달 내용 -->
        <div class="relative bg-white shadow-lg w-full max-w-2/3 z-10 pb-10">
            <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-4 p-2">
                <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="$emit('confirm')" />
            </div>
            <p class="m-6 text-gray-700 text-2xl font-extrabold">세금 명세서 발급</p>

            <p class="mx-10 text-gray-700 text-md font-extrabold">공급자 정보</p>
            <div class="grid grid-cols-3 mx-10">
                <!-- 상호명 -->
                <label
                    class="flex items-center pl-3 h-full bg-gray-200 border border-gray-300 font-semibold self-center">파트너사명</label>
                <div class="col-span-2 p-2 border border-gray-300">
                    <input v-model="invoiceForm.companyName" type="text"
                        class="flex w-1/2 border border-gray-300 text-md" />
                </div>

                <!-- 사업자 등록번호 -->
                <label
                    class="flex items-center pl-3 h-full bg-gray-200 border border-gray-300 font-semibold self-center">사업자
                    등록번호</label>
                <div class="col-span-2 p-2 border border-gray-300">
                    <input v-model="invoiceForm.companyNumber" type="text" placeholder="000-00-00000"
                        class="flex w-1/2 border border-gray-300 text-md" />
                </div>

                <!-- 대표자명 -->
                <label
                    class="flex items-center pl-3 h-full bg-gray-200 border border-gray-300 font-semibold self-center">대표자명</label>
                <div class="col-span-2 p-2 border border-gray-300">
                    <input v-model="invoiceForm.ceoName" type="text"
                        class="flex w-1/2 border border-gray-300 text-md" />
                </div>

                <!-- 사업장 주소 -->
                <label
                    class="flex items-center pl-3 h-full bg-gray-200 border border-gray-300 font-semibold self-center">사업장
                    주소</label>
                <div class="col-span-2 p-2 border border-gray-300">
                    <input v-model="invoiceForm.companyAdress" type="text"
                        class="flex w-1/2 border border-gray-300 text-md" />
                </div>

                <!-- 업태 -->
                <!-- <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-300 font-semibold self-center">업종</label>
            <div class="col-span-2 p-2 border border-gray-300">
                <input v-model="invoiceForm.typeOfBusiness" type="text" class="flex w-1/2 border border-gray-300 text-md">
            </div> -->

                <!-- 종류 -->
                <!-- <label class=" flex items-center pl-3 h-full bg-gray-200 border border-gray-300 font-semibold self-center">종류</label>
            <div class="col-span-2 p-2 border border-gray-300">
                <input v-model="invoiceForm.industry" type="text" class="flex w-1/2 border border-gray-300 text-md">
            </div> -->
            </div>

            <p class="mt-8 mx-10 text-gray-700 text-md font-extrabold">주문 정보</p>
            <DynamicTable :columns="orderColumns" :items="orderList" :isLoading="isTableLoading" class="px-5">
                <template #cell-id="{ item }">
                    <strong>{{ item.id }}</strong>
                </template>
            </DynamicTable>

            <!-- 페이지 네비 -->
            <PageNav v-if="totalPages > 3" :currentPage="Number(currentPage)" :totalPages="Number(totalPages)"
                @set-page="handleSetPage" />

            <div class="flex justify-end">
                <button @click="onIssued"
                    class="mt-5 mr-9 px-6 py-3 w-1/6 bg-orange-600 text-white font-bold hover:bg-orange-700 transition">발급</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import xmark from "@/assets/xmark.svg";
import DynamicTable from "../DynamicTable.vue";
import PageNav from "@/components/common/PageNav.vue";
import {ref, reactive, watch} from "vue";
import apiClient from "@/api";

const isTableLoading = ref(false); // 로딩 상태 관리

const currentPage = ref(1); // 현재 페이지 상태 관리
const totalPages = ref(0); // 총 페이지 수 상태 관리
const pageSize = ref(3); // 페이지당 항목 수 (고정값)

const props = defineProps({
    visible: Boolean,
    orderId: Number,
});
const emit = defineEmits(["confirm"]);

function onClose() {
    showModal.value = false;
}

async function onIssued() {
    isTableLoading.value = true;
    try {
        console.log(props.orderId);
        const response = await apiClient.put("/settlement/update", {
            settlementId: props.orderId,
        });

        if (response.data.statusCode === 200 && response.data.data === "SUCCESS") {
            const requestBody = {
                id: props.orderId,
                emailType: "SETTLE_STATUS",
            };
            apiClient.post("/notify/email/", requestBody);

            alert("발급 되었습니다");
            emit("confirm");
            // await router.push("/admin/settlement");
        } else {
            alert("발급 처리에 실패했습니다. 다시 시도해주세요.");
            console.error("응답 내용:", response.data);
        }
    } catch (error) {
        console.error("발급 요청 실패:", error);
        alert("서버와 통신 중 문제가 발생했습니다.");
    } finally {
        isTableLoading.value = false; // 로딩 종료
    }
}

const invoiceForm = reactive({
    companyName: "",
    companyNumber: "",
    ceoName: "",
    companyAdress: "",
});

const orderColumns = ref([
    {label: "월", key: "month"},
    {label: "일", key: "day"},
    {label: "품목", key: "product"},
    {label: "수량", key: "quantity"},
    //   { label: '단가', key: 'unitPrice' },
    //   { label: '공급가액', key: 'supplyPrice' },
    //   { label: '세액', key: 'taxPrice' },
    //   { label: '상태', key: 'orderStatus' },
]);

const orderList = ref([]);

const fetchData = async () => {
    if (!props.orderId) return;

    try {
        console.log(props.orderId);
        const companyRes = await apiClient.get(`/settlement/${props.orderId}/companyInfo`);
        const companyData = companyRes.data.data;
        console.log("주문별 거래처 조회", companyData);
        Object.assign(invoiceForm, {
            companyName: companyData.companyName,
            companyNumber: companyData.registrationNumber,
            ceoName: companyData.representName,
            companyAdress: companyData.address,
        });

        // 기본 요청 파라미터
        const params = {
            page: currentPage.value - 1, // 현재 페이지 번호 -1 (0 기반 인덱스)
            size: pageSize.value,
        };

        const orderRes = await apiClient.get(`/settlement/${props.orderId}/orderInfo`,{
            params: params,
        });
        const orderData = orderRes.data.data.content;
        totalPages.value = orderRes.data.data.page.totalPages;

        console.log("주문별 주문상품 조회", orderData);
        orderList.value = orderData.map((item) => ({
            month: new Date(item.orderDate).getMonth(),
            day: new Date(item.orderDate).getDate(),
            product: item.productName,
            quantity: item.quantity,
            // unitPrice: item.unitPrice,
            // supplyPrice: item.supplyPrice,
            // taxPrice: item.taxPrice,
            // orderStatus: item.orderStatus
        }));
    } catch (error) {
        console.log("주문 거래처 정보 불러오기 실패", error);
    }
};

// ------- 페이지네이션 --------
const handleSetPage = (page) => {
    if (currentPage.value === page) return;

    currentPage.value = page;
};

watch(
    [() => props.orderId, currentPage],
    ([newOrderId, newCurrentPage], [oldOrderId, oldCurrentPage]) => {
        // orderId가 변경되었거나, currentPage가 변경되었을 때 데이터를 다시 가져옴
        if (newOrderId || (newOrderId === oldOrderId && newCurrentPage !== oldCurrentPage)) {
            fetchData();
        }
    },
    { immediate: true } // 컴포넌트 마운트 시점에 orderId가 이미 있을 경우 즉시 실행
);
</script>
