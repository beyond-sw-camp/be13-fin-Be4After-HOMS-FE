<template>
    <div>
        <Breadcrumb />
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons"
            :userRole="currentUserRole" />
        <div class="flex flex-col">
            <div class="flex items-end ml-auto mr-5">
                <button @click="goDeliveryAddress"
                    class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm">
                    배송지 관리
                </button>
            </div>
            <DynamicTable :columns="deliveryColumns" :items="delivery" :showCheckbox="false" :page="currentPage"
                :pageSize="pageSize" :isLoading="isTableLoading">
                <!-- <template #actions="{ item }">
                </template> -->
            </DynamicTable>
        </div>
        <div class="flex mx-10 mt-10">
            <DeliveryState :counts="statusCounts"></DeliveryState>
        </div>
    </div>
</template>

<script setup>
import apiClient from "@/api";
import DynamicTable from "@/components/common/DynamicTable.vue";
import DeliveryState from "@/components/dashboard/admin/DeliveryState.vue";
import { useAuthStore } from "@/states/auth";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Breadcrumb from '@/components/common/Breadcrumb.vue';

const isTableLoading = ref(false); // 로딩 상태 관리

const route = useRouter();
const authstore = useAuthStore();

const delivery = ref([])

const deliveryColumns = ref([
    {label: "주문번호", key: "orderCode"},
    {label: "거래처명", key: "companyName"},
    {label: "배송지", key: "deliveryName"},
    {label: "주문일", key: "orderDate"},
    {label: "출고예정일", key: "deliveryDate"},
    {label: "운송장", key: "waybill"},
    {label: "배송상태", key: "deliveryStatus"},
]);

const statusCounts = ref({
    BEFORE: 0,
    SHIPPING: 0,
    COMPLETED: 0,
    COLLECT: 0,
});

const mapDeliveryStatus = (deliveryStatus) => {
switch (deliveryStatus) {
  case 'BEFORE':
    return '배송전';
  case 'SHIPPING':
    return '배송중';
  case 'COMPLETED':
    return '납품 완료';
  case 'COLLECT':
    return '회수';
  default:
    return '알 수 없음'; // 예외 처리
}
};

const DeliveryInfo = async () => {
    const response = await apiClient.get(`/order/deliveryInfo/${authstore.user.userId}`)
    const data = response.data.data

        // 상태별 count 초기화
    const counts = {
        BEFORE: 0,
        SHIPPING: 0,
        COMPLETED: 0,
        COLLECT: 0,
    };

    console.log(data)

    data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    
    delivery.value = data.map(item => {
        const status = item.deliveryStatus;
        if (counts[status] !== undefined) {
            counts[status]++;
        }

        return {
            orderCode: item.orderCode,
            companyName: item.companyName,
            deliveryName: item.deliveryName,
            orderDate: new Date(item.orderDate).toISOString().split('T')[0],
            deliveryDate: new Date(item.deliveryDate).toISOString().split('T')[0],
            waybill: item.waybill,
            deliveryStatus: mapDeliveryStatus(status),

        };
    });
    statusCounts.value = counts;
    

}

const goDeliveryAddress = () => {
    route.push({name:'DeliveryAddress'})
}

onMounted(() => {
    DeliveryInfo();
})

</script>

<style lang="scss" scoped></style>