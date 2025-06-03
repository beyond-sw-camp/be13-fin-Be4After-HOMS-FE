import {useAuthStore} from "@/states/auth";
import {createRouter, createWebHistory, type RouteRecordRaw} from "vue-router";
import {userStore} from "@/states/user"; // 유저 스토어
import {storeToRefs} from "pinia";
import {fetchUserProfile} from "@/api/user";

import AdminDashBoard from "@/pages/admin/dashboard/AdminDashBoard.vue";
import AdminAccount from "@/pages/admin/account/AdminAccount.vue";
import BaseLayout from "@/components/common/BaseLayout.vue";
import Setting from "@/pages/common/Setting.vue";
import Claims from "@/pages/admin/order/Claim.vue";
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
import ContractForm from "@/pages/admin/clients/ContractForm.vue";

// 에러 관련
import PageNotFound from "@/pages/common/PageNotFound.vue";

// 채팅테스트용
import ChatTest from '@/pages/common/ChatTest.vue'





const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/',
    //   redirect: 'login'
    // },
    {
      path: "/login",
      component: Login,
    },
    {
      path: "/admin",
      name: "AdminLayout",
      component: BaseLayout,
      meta: {requiresAuth: true, role: "ROLE_ADMIN"}, // 대시보드 진입을 위한 주석
      children: [
        {
          path: "",
          name: "AdminDashBoard",
          component: AdminDashBoard,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "adminaccount",
          name: "AdminAccount",
          component: AdminAccount,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "user/:id",
          name: "AccountDetail",
          component: AccountDetail,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "settlements",
          name: "AdminSettlement",
          component: AdminSettlements,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "claims",
          name: "AdminClaims",
          component: Claims,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "menu-settings",
          name: "MenuSettings",
          component: MenuSettings,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "clients",
          name: "Clients",
          component: Clients,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: '/admin/client/:id',
          name: 'ClientDetail',
          component: ClientsDetail,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "contracts",
          name: "Contracts",
          component: Contracts,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "contractForm",
          name: "ContractForm",
          component: ContractForm,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "categories",
          name: "Categories",
          component: Categories,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "notices/form",
          name: "AdminNoticesFrom",
          component: AdminNoticesForm,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "products/form",
          name: "ProductForm",
          component: ProductForm,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "setting",
          name: "Setting",
          component: Setting,
          // meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path: "delivery",
          name: "AdminDelivery",
          component : AdminDelivery,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        },
        {
          path:"deliveryAddress",
          name: "AdminDeliveryAddress",
          component : AdminDeliveryAddress,
          meta: {requiresAuth: true, role: "ROLE_ADMIN"},
        }
      ],
    },
    {
      path: "/",
      name: "UserLayout",
      component: BaseLayout,
      meta: {requiresAuth: true, role: "ROLE_USER"},
      children: [
        {
          path: "",
          name: "UserDashBoard",
          component: UserDashBoard,
          meta: {requiresAuth: true, role: "ROLE_USER"}, // 대시보드 진입을 위한 주석
        },
        {
          path: "accounts",
          name: "Accounts",
          component: Accounts,
          meta: {requiresAuth: true, role: "ROLE_USER"},
        },
        {
          path: "products",
          name: "UserProducts",
          component: Products,
          meta: {requiresAuth: false},
        },
        {
          path: "orders",
          name: "UserOrders",
          component: Orders,
          meta: {requiresAuth: false},
        },
        {
          path: "orders/list",
          name: "OrderItemList",
          component: OrderItemList,
          meta: {requiresAuth: false},
        },
        {
          path: "delivery",
          name: "Delivery",
          component: Deliverys,
          meta: {requiresAuth: true, role: "ROLE_USER"},
        },
        {
          path: "deliveryAddress",
          name: "DeliveryAddress",
          component: DeliveryAddress,
          meta: {requiresAuth: true, role: "ROLE_USER"},
        },
        {
          path: "settlements",
          name: "UserSettlements",
          component: Settlements,
          meta: {requiresAuth: true, role: "ROLE_USER"},
        },
        {
          path: "notices",
          name: "UserNotices",
          component: Notices,
          meta: {requiresAuth: false},
        },
        {
          path: "notices/:id",
          name: "UserNoticesDetail",
          component: NoticesDetail,
          meta: {requiresAuth: false},
        },
      ],
    },
    {
      path: "/:pathMatch(.*)",
      redirect: "/404",
    },
    {
      path: "/404",
      component: PageNotFound,
    },
    // 채팅 테스트용 라우트
    {
    // 예: /chat/5 라우트로 접속하면 otherUserId=5로 채팅방 생성/조회
    path: '/chat/:otherUserId',
    name: 'chat',
    component: ChatTest,
    props: true             // props(otherUserId)를 ChatTest에 전달
    }
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
