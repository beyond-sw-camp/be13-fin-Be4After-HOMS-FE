<template>
    <div>
        <!-- 제목 -->
        <div class="text-3xl px-3 py-3">
        <span>배송 현황</span>
        </div>
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons" :userRole="currentUserRole" />
        <DynamicTable :columns="deliveryColumns" :items="users" :showCheckbox="false" :page="currentPage" :pageSize="pageSize">
            <template #actions="{ item }">
            </template>
        </DynamicTable>
    </div>
</template>

<script setup>
import DynamicTable from "@/components/common/DynamicTable.vue";


const deliveryColumns = ref([
    {label: "발주번호", key: "orderCode"},
    {label: "거래처명", key: "companyName"},
    {label: "납품장소", key: "deliveryName"},
    {label: "요청일", key: "orderDate"},
    {label: "납기일", key: "dueDate"},
    {label: "승인상태", key: "approved"},
]);

</script>

<style lang="scss" scoped>

</style>