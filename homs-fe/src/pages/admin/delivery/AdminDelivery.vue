<template>
    <div>
        <!-- 제목 -->
        <div class="text-3xl px-3 py-3">
            <span>배송 현황</span>
        </div>
        <DynamicTable :columns="deliveryColumns" :items="delivery" :showCheckbox="false" :page="currentPage" :pageSize="pageSize">
            <template #actions="{ item }">
            </template>
        </DynamicTable>
        <div class="flex mt-10">
            <DeliveryState></DeliveryState>
        </div>
    </div>
</template>

<script setup>
import DynamicTable from "@/components/common/DynamicTable.vue";
import DeliveryState from "@/components/dashboard/admin/DeliveryState.vue";
import { ref } from "vue";

const delivery = ref([
    {orderCode: "H-04-23", companyName: "영광상사", deliveryName: "서울", orderDate: "25-04-02", deliveryDate: "25-04-11", waybill:"103-94-1952", deliveryStatus: "BEFORE"},
    {orderCode: "H-04-23", companyName: "영광상사", deliveryName: "서울", orderDate: "25-04-02", deliveryDate: "25-04-11", waybill:"103-94-1952", deliveryStatus: "BEFORE"},
    {orderCode: "H-04-23", companyName: "하이젠버그", deliveryName: "미국", orderDate: "25-04-02", deliveryDate: "25-04-11", waybill:"103-94-1952", deliveryStatus: "BEFORE"},
]);

const deliveryColumns = ref([
    {label: "발주번호", key: "orderCode"},
    {label: "거래처명", key: "companyName"},
    {label: "배송지", key: "deliveryName"},
    {label: "주문일", key: "orderDate"},
    {label: "출고예정일", key: "deliveryDate"},
    {label: "운송장", key: "waybill"},
    {label: "배송 상태", key: "deliveryStatus"},
]);


</script>

<style lang="scss" scoped>

</style>