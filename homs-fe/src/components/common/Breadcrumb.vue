<template>
    <nav aria-label="breadcrumb" class="text-lg sm:text-xl font-medium text-black px-3 py-3">
        <ol class="flex items-center space-x-1">
            <li v-for="(crumb, index) in breadcrumbs" :key="crumb.path + index" class="flex items-center">
                <template v-if="index === 0 && crumb.meta.isHome">
                    <router-link :to="crumb.path" class="hover:text-orange-600 transition-colors">
                        <span class="sr-only">Go to Home</span>
                        <svg class="w-[30px] h-[30px]" fill="currentColor" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
                            <path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z" />
                        </svg>
                    </router-link>
                </template>
                <template v-else-if="index < breadcrumbs.length - 1">
                    <span class="mx-2 text-black">/</span>
                    <router-link :to="crumb.path" class="hover:text-orange-600 transition-colors">{{ getCrumbName(crumb) }}</router-link>
                </template>
                <template v-else>
                    <span class="mx-2 text-black">/</span>
                    <span class="text-black" aria-current="page">{{ getCrumbName(crumb) }}</span>
                </template>
            </li>
        </ol>
    </nav>
</template>

<script setup>
import {computed, ref} from "vue";
import {useRoute} from "vue-router";
import {useAuthStore} from "@/states/auth";

const authStore = useAuthStore();

const route = useRoute();

const breadcrumbs = computed(() => {
    const matched = route.matched;
    const crumbs = [];

    const adminUrl = ref("");

    // 권한 확인해서 어드민이면 admin 주소로 이동
    if (authStore.isAdmin) {
        adminUrl.value = "admin";
    }
    // 1. '홈' 항목 강제 추가
    crumbs.push({
        path: "/" + adminUrl.value,
        meta: {breadcrumb: "홈", isHome: true},
        params: {},
    });

    // 2. matched 배열을 순회하며 crumbs 구성
    matched.forEach((record) => {
        // 레이아웃 라우트(UserLayout, AdminLayout) 및 홈 라우트는 건너뛰기
        if (record.name === "UserLayout" || record.name === "AdminLayout" || record.path === "/") {
            return;
        }

        // 2-1. 그룹 이름 추가 (group meta가 있고, 아직 추가되지 않았다면)
        // 2-1. 그룹 이름 추가 (group meta가 있고, 아직 추가되지 않았다면)
        if (record.meta && record.meta.group) {
            const groupExists = crumbs.some((c) => c.meta.breadcrumb === record.meta.group && c.meta.isGroup);
            if (!groupExists) {
                // 그룹의 'path'는 해당 그룹의 첫 번째 목록 페이지로 설정
                // 예를 들어 '주문 관리' 그룹은 '/orders'로 연결
                // 이 부분은 라우터 구조에 따라 유연하게 변경해야 합니다.
                let groupPath = "";

                // Determine groupPath based on the group name
                switch (record.meta.group) {
                    case "계정 관리":
                        groupPath = record.path.startsWith("/admin") ? "/admin/accounts" : "/accounts";
                        break;
                    case "정산 관리":
                        groupPath = record.path.startsWith("/admin") ? "/admin/settlements" : "/settlements";
                        break;
                    case "설정":
                        // Assuming "메뉴 설정" and "계정 설정" both fall under the "설정" group
                        groupPath = record.path.startsWith("/admin") ? "/admin/menu-settings" : "/setting";
                        break;
                    case "거래처 관리":
                        groupPath = "/admin/clients";
                        break;
                    case "계약 관리":
                        groupPath = "/admin/contracts";
                        break;
                    case "상품 관리":
                        groupPath = "/products";
                        break;
                    case "공지사항":
                        groupPath = record.path.startsWith("/admin") ? "/admin/notices" : "/notices";
                        break;
                    case "배송 관리":
                        groupPath = record.path.startsWith("/admin") ? "/admin/delivery" : "/delivery";
                        break;
                    case "주문 관리":
                        groupPath = "/orders";
                        break;
                    case "클레임 관리":
                        groupPath = "/claims";
                        break;
                    // Add any other groups here
                    default:
                        // Fallback: If no specific group path is defined, try to derive it
                        groupPath = record.path.split("/").slice(0, -1).join("/") || "/";
                        if (groupPath === "") {
                            groupPath = `/${record.path.split("/")[0]}`;
                        }
                        break;
                }

                crumbs.push({
                    path: groupPath, // 그룹의 루트 경로 (예: /orders)
                    meta: {breadcrumb: record.meta.group, isGroup: true},
                    params: {},
                });
            }
        }

        // 2-2. 현재 라우트의 breadcrumb 추가
        if (record.meta && record.meta.breadcrumb) {
            let currentPath = record.path;
            if (record.path.includes(":")) {
                Object.keys(route.params).forEach((key) => {
                    currentPath = currentPath.replace(`:${key}`, route.params[key]);
                });
            }

            crumbs.push({
                path: currentPath,
                meta: record.meta,
                params: route.params,
            });
        }
    });

    // 중복되는 브레드스크럼 항목 제거
    const uniqueCrumbs = [];
    const seenIdentifiers = new Set(); // 경로 + 텍스트로 고유하게 식별
    crumbs.forEach((crumb) => {
        const crumbText = typeof crumb.meta.breadcrumb === "function" ? crumb.meta.breadcrumb(crumb) : crumb.meta.breadcrumb;
        const identifier = `${crumb.path}-${crumbText}`; // 경로와 텍스트 조합으로 고유 ID 생성

        if (!seenIdentifiers.has(identifier)) {
            uniqueCrumbs.push(crumb);
            seenIdentifiers.add(identifier);
        }
    });

    return uniqueCrumbs;
});

const getCrumbName = (crumb) => {
    if (typeof crumb.meta.breadcrumb === "function") {
        return crumb.meta.breadcrumb(crumb);
    }
    return crumb.meta.breadcrumb;
};
</script>
