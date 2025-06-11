<template>
  <div class="w-full max-w-1/2 p-4 bg-white border border-gray-300 rounded-3xl shadow-lg sm:p-8">
    <div class="flex items-center justify-between mb-4">
      <h5 class="text-xl font-bold leading-none text-gray-900">주문 건</h5>
      <a @click.prevent="goToOrderForm" class="text-sm font-medium hover:underline">+</a>
    </div>

    <Spinner :visible="isLoading" message="주문 목록 불러오는 중..." />

    <div class="flow-root">
      <ul role="list" class="divide-y divide-gray-200">
        <!-- 헤더 -->
        <li class="py-3 sm:py-4">
          <div class="flex w-full justify-around">
            <p class="w-1/5 text-base font-bold text-gray-900 text-center truncate">주문 번호</p>
            <p class="w-1/5 text-base font-bold text-gray-900 text-center truncate">거래처명</p>
            <p class="w-1/5 text-base font-bold text-gray-900 text-center truncate">납품장소</p>
            <p class="w-1/5 text-base font-bold text-gray-900 text-center truncate">요청일</p>
            <p class="w-1/5 text-base font-bold text-gray-900 text-center truncate">승인상태</p>
          </div>
        </li>

        <!-- 데이터 목록 -->
        <li v-if="isLoading" class="py-3 sm:py-4 text-center text-gray-500">
        </li>
        <li v-else-if="orderList.length === 0" class="py-3 sm:py-4 text-center text-gray-500">
          표시할 주문 내역이 없습니다.
        </li>
        <li v-else v-for="(order, index) in orderList" :key="index" class="py-3 sm:py-4">
          <div class="flex items-center w-full justify-between">
            <p class="w-1/5 text-base font-bold text-center text-gray-900 truncate">{{ order.orderCode }}</p>
            <p class="w-1/5 text-base font-bold text-center text-gray-900 truncate">{{ order.companyName }}</p>
            <p class="w-1/5 text-base font-bold text-center text-gray-900 truncate">{{ order.deliveryName }}</p>
            <p class="w-1/5 text-base font-bold text-center text-gray-900 truncate">{{ new
              Date(order.orderDate).toISOString().split('T')[0] }}</p>
            <p class="w-1/5 text-base font-bold text-center truncate text-green-700" v-if="order.approved === true">승인
            </p>
            <p class="w-1/5 text-base font-bold text-center truncate text-red-600"
              v-else-if="order.approved === false && order.rejectReason !== null">거부</p>
            <p class="w-1/5 text-base font-bold text-center truncate text-orange-400" v-else>미승인</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
  import Spinner from "@/components/common/Loading.vue";
  import { ref, onMounted } from 'vue'
  import apiClient from '@/api'
  import { useRouter } from 'vue-router'
  
  const isOrderListLoading = ref(false);
  const orderList = ref([])
  const router = useRouter()

  function goToOrderForm() {
  router.push("/orders")
}

  // 데이터 가져오는 함수
const fetchData = async () => {
  isOrderListLoading.value = true;
  const params = {
        page: 0,
        size: 5,
    };
    try {
        const response = await apiClient.get("/order/", {
            params: params, // 여기에 구성한 파라미터 객체를 전달합니다.
        });
        if (response.status === 200) {
            orderList.value = response.data.data.content;
            console.log(orderList.value);
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(t("errors.fetch_data_erro"), err);
    } finally {
      isOrderListLoading.value = false;
    }
};

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(() => {
    fetchData();
});


  </script>