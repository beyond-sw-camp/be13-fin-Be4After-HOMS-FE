import {useAuthStore} from "@/states/auth";
import {createRouter, createWebHistory, type RouteRecordRaw} from "vue-router";
import {userStore} from "@/states/user"; // 유저 스토어
import {storeToRefs} from "pinia";
import {fetchUserProfile} from "@/api/user";

import AdminDashBoard from "@/pages/admin/dashboard/AdminDashBoard.vue";
import AdminAccount from "@/pages/admin/account/AdminAccount.vue";
import BaseLayout from "@/components/common/BaseLayout.vue";
import Setting from "@/pages/common/Setting.vue";
import ProductForm from "@/pages/admin/product/ProductForm.vue";
import Categories from "@/pages/admin/product/Categories.vue";
import Clients from "@/pages/admin/clients/Clients.vue";
import ClientsDetail from "@/pages/admin/clients/ClientsDetail.vue";
import Contracts from "@/pages/admin/clients/Contracts.vue";
import MenuSettings from "@/pages/admin/menu/MenuSettings.vue";
import Login from "@/pages/common/login/Login.vue";
import AdminSettlements from "@/pages/admin/settlement/Settlements.vue";
import AccountDetail from "@/pages/admin/account/AccountDetail.vue";
import AdminDelivery from "@/pages/admin/delivery/AdminDelivery.vue";
import AdminDeliveryAddress from "@/pages/admin/delivery/AdminDeliveryAddress.vue";

// 유저 관련
import UserDashBoard from "@/pages/user/dashboard/UserDashBoard.vue";
import Accounts from "@/pages/user/account/Account.vue";
import Products from "@/pages/user/product/Products.vue";
import Orders from "@/pages/user/order/Order.vue";
import OrderItemList from "@/pages/user/order/OrderItemList.vue";
import Deliverys from "@/pages/user/delivery/Delivery.vue";
import Settlements from "@/pages/user/settlement/Settlements.vue";
import Notices from "@/pages/user/notice/Notices.vue";
import NoticesDetail from "@/pages/user/notice/NoticesDetail.vue";
import AdminNoticesForm from "@/pages/admin/notice/NoticesForm.vue";
import DeliveryAddress from "@/pages/user/delivery/DeliveryAddress.vue";
import ClaimItem from "@/pages/user/order/ClaimItem.vue";
import Claims from "@/pages/user/order/Claims.vue";

import ContractForm from "@/pages/admin/clients/ContractForm.vue";

// 에러 관련
import PageNotFound from "@/pages/common/PageNotFound.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      component: Login,
      meta: {breadcrumb: "로그인"}, // 로그인 페이지 브레드스크럼 추가
    },
    // 관리자 레이아웃
    {
      path: "/admin",
      name: "AdminLayout",
      component: BaseLayout, // AdminLayout이 별도로 없다면 BaseLayout 사용
      meta: {requiresAuth: true, role: "ROLE_ADMIN", breadcrumb: "관리자"},
      children: [
        {
          path: "", // /admin
          name: "AdminDashBoard",
          component: AdminDashBoard,
          meta: {
            requiresAuth: true,
            role: "ROLE_ADMIN",
            breadcrumb: "대시보드",
          },
        },
        // --- 관리자 계정 관리 그룹 ---
        {
          path: "accounts", // /admin/accounts
          meta: {requiresAuth: true, role: "ROLE_ADMIN", group: "계정 관리"},
          children: [
            {
              path: "", // /admin/accounts
              name: "AdminAccount",
              component: AdminAccount,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: "계정 목록",
              },
            },
            {
              path: ":id", // /admin/accounts/:id
              name: "AccountDetail",
              component: AccountDetail,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: (route: {params: {id: any}}) => `계정 상세`,
              },
            },
          ],
        },
        // --- 관리자 정산 관리 그룹 ---
        {
          path: "settlements", // /admin/settlements
          name: "AdminSettlement",
          component: AdminSettlements,
          meta: {
            requiresAuth: true,
            role: "ROLE_ADMIN",
            breadcrumb: "정산 관리",
            group: "정산 관리",
          },
        },
        // --- 관리자 메뉴 설정 그룹 ---
        {
          path: "menu-settings", // /admin/menu-settings
          name: "MenuSettings",
          component: MenuSettings,
          meta: {
            requiresAuth: true,
            role: "ROLE_ADMIN",
            breadcrumb: "메뉴 설정",
            group: "설정",
          },
        },
        // --- 관리자 거래처 관리 그룹 ---
        {
          path: "clients", // /admin/clients
          meta: {requiresAuth: true, role: "ROLE_ADMIN", group: "거래처 관리"},
          children: [
            {
              path: "", // /admin/clients
              name: "Clients",
              component: Clients,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: "거래처 목록",
              },
            },
            {
              path: ":id", // /admin/clients/:id
              name: "ClientDetail",
              component: ClientsDetail,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: (route: {params: {id: any}}) => `거래처 상세`,
              },
            },
          ],
        },
        // --- 관리자 계약 관리 그룹 ---
        {
          path: "contracts", // /admin/contracts
          meta: {requiresAuth: true, role: "ROLE_ADMIN", group: "계약 관리"},
          children: [
            {
              path: "", // /admin/contracts
              name: "Contracts",
              component: Contracts,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: "계약 목록",
              },
            },
            {
              path: "form", // /admin/contracts/form (계약 등록은 별도의 상세 개념으로 볼 수 있음)
              name: "ContractForm",
              component: ContractForm,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: "계약 등록",
              },
            },
          ],
        },
        // --- 관리자 카테고리 관리 그룹 ---
        {
          path: "categories", // /admin/categories
          name: "Categories",
          component: Categories,
          meta: {
            requiresAuth: true,
            role: "ROLE_ADMIN",
            breadcrumb: "카테고리 관리",
            group: "상품 관리",
          },
        },
        // --- 관리자 공지사항 관리 그룹 (폼을 상세로) ---
        {
          path: "notices", // /admin/notices
          meta: {
            requiresAuth: true,
            role: "ROLE_ADMIN",
            group: "공지사항",
          },
          children: [
            // (만약 공지사항 목록 페이지가 있다면 여기에 path: "" 로 추가)
            {
              path: "form", // /admin/notices/form (등록/수정 폼)
              name: "AdminNoticesFrom",
              component: AdminNoticesForm,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: "등록/수정",
              },
            },
          ],
        },
        // --- 관리자 상품 관리 그룹 (폼을 상세로) ---
        {
          path: "products", // /admin/products
          meta: {requiresAuth: true, role: "ROLE_ADMIN", group: "상품 관리"},
          children: [
            // (만약 상품 목록 페이지가 있다면 여기에 path: "" 로 추가)
            {
              path: "form", // /admin/products/form (등록/수정 폼)
              name: "ProductForm",
              component: ProductForm,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: "상품 등록/수정",
              },
            },
          ],
        },
        // --- 관리자 설정 그룹 (기존 setting과 겹치므로 통합) ---
        {
          path: "setting", // /admin/setting
          name: "Setting",
          component: Setting,
          meta: {breadcrumb: "계정 설정", group: "설정"}, // 그룹 "설정"으로 묶고 이름 변경
        },
        // --- 관리자 배송 관리 그룹 ---
        {
          path: "delivery", // /admin/delivery
          meta: {requiresAuth: true, role: "ROLE_ADMIN", group: "배송 관리"},
          children: [
            {
              path: "", // /admin/delivery
              name: "AdminDelivery",
              component: AdminDelivery,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: "배송 현황",
              },
            },
            {
              path: "address", // /admin/delivery/address
              name: "AdminDeliveryAddress",
              component: AdminDeliveryAddress,
              meta: {
                requiresAuth: true,
                role: "ROLE_ADMIN",
                breadcrumb: "배송지 관리",
              },
            },
          ],
        },
      ],
    },
    // 사용자 레이아웃
    {
      path: "/", // 사용자 레이아웃의 시작점
      name: "UserLayout",
      component: BaseLayout,
      meta: {requiresAuth: true, role: "ROLE_USER", breadcrumb: "홈"}, // '홈'으로 시작
      children: [
        {
          path: "", // /
          name: "UserDashBoard",
          component: UserDashBoard,
          meta: {requiresAuth: true, role: "ROLE_USER", breadcrumb: "대시보드"},
        },
        // --- 사용자 계정 설정 그룹 ---
        {
          path: "accounts", // /accounts
          name: "Accounts",
          component: Accounts,
          meta: {
            requiresAuth: true,
            role: "ROLE_USER",
            breadcrumb: "계정 설정",
            group: "계정 관리",
          },
        },
        // --- 사용자 상품 목록 그룹 ---
        {
          path: "products", // /products
          name: "UserProducts",
          component: Products,
          meta: {
            requiresAuth: false,
            breadcrumb: "상품 목록",
            group: "상품 관리",
          },
        },
        // --- 사용자 주문 관리 그룹 ---
        {
          path: "orders", // /orders (부모 경로)
          meta: {requiresAuth: false, group: "주문 관리"}, // 그룹 정의
          children: [
            {
              path: "", // /orders
              name: "UserOrders",
              component: Orders,
              meta: {requiresAuth: false, breadcrumb: "주문 목록"},
            },
            {
              path: "list", // /orders/list
              name: "OrderItemList",
              component: OrderItemList,
              meta: {requiresAuth: false, breadcrumb: "주문 상세"},
            },
          ],
        },
        // --- 사용자 배송 관리 그룹 ---
        {
          path: "delivery", // /delivery (부모 경로)
          meta: {requiresAuth: true, role: "ROLE_USER", group: "배송 관리"},
          children: [
            {
              path: "", // /delivery
              name: "Delivery",
              component: Deliverys,
              meta: {
                requiresAuth: true,
                role: "ROLE_USER",
                breadcrumb: "배송 조회",
              },
            },
            {
              path: "address", // /delivery/address
              name: "DeliveryAddress",
              component: DeliveryAddress,
              meta: {
                requiresAuth: true,
                role: "ROLE_USER",
                breadcrumb: "배송지 관리",
              },
            },
          ],
        },
        // --- 사용자 정산 내역 그룹 ---
        {
          path: "settlements", // /settlements
          name: "UserSettlements",
          component: Settlements,
          meta: {
            requiresAuth: true,
            role: "ROLE_USER",
            breadcrumb: "내역",
            group: "정산관리",
          },
        },
        // --- 사용자 공지사항 그룹 ---
        {
          path: "notices", // /notices (부모 경로)
          meta: {requiresAuth: false, group: "공지사항"},
          children: [
            {
              path: "", // /notices
              name: "UserNotices",
              component: Notices,
              meta: {requiresAuth: false, breadcrumb: "목록"},
            },
            {
              path: ":id", // /notices/:id
              name: "UserNoticesDetail",
              component: NoticesDetail,
              meta: {
                requiresAuth: false,
                breadcrumb: (route: {params: {id: any}}) => `상세`,
              },
            },
          ],
        },
        // --- 사용자 클레임 관리 그룹 ---
        {
          path: "claims", // /claims (부모 경로)
          meta: {requiresAuth: false, group: "클레임 관리"},
          children: [
            {
              path: "", // /claims
              name: "Claims",
              component: Claims,
              meta: {requiresAuth: false, breadcrumb: "클레임 목록"},
            },
            {
              path: "item/:orderId", // /claims/item/:orderId (클레임 상세)
              name: "ClaimItem",
              component: ClaimItem,
              meta: {
                requiresAuth: false,
                breadcrumb: (route: {params: {orderId: any}}) => `클레임 상세`,
              },
            },
          ],
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*", // 모든 미스매치 경로를 404로 리다이렉트
      redirect: "/404",
    },
    {
      path: "/404",
      component: PageNotFound,
      meta: {breadcrumb: "페이지를 찾을 수 없음"},
    },
  ],
});

// 로그인 상태 관리 (권한)
router.beforeEach((to, from, next) => {
  // const userAuth = userStore()
  // const { role } = storeToRefs(userAuth)

  const authStore = useAuthStore();
  const role = authStore.user?.role;

  const requiresAuth = to.meta.requiresAuth;
  const allowedRole = to.meta.role as "ROLE_ADMIN" | "ROLE_USER" | undefined;

  console.log("라우팅 가드: role =", role);
  console.log("라우팅 가드: 이동하려는 페이지 =", to.fullPath);

  // 인증
  if (requiresAuth && !role) {
    if (to.path !== "/login") {
      return next({path: "/login"});
    }
  }
  return next();
});

export default router;
