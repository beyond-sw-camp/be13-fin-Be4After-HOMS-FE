<template>
    <!-- 제목 -->
        <div class="text-3xl px-3 py-3">
        <span>배송 현황</span>
        </div>
        <!-- 검색바 -->
        <SearchBox @search="handleSearch" :selectOptions="handleSelectOption" :buttons="actionButtons"
        :userRole="currentUserRole" />
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>