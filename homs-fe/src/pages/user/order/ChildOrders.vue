<template>
  <div class="sm:pl-4 pr-4">
    <div class="w-full bg-white border border-gray-300 rounded-3xl shadow-lg sm:p-8">
      <div class="flex items-center justify-between mb-4">
        <h5 class="text-xl font-bold leading-none text-gray-900">주문 건</h5>
      </div>

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
          <li v-if="orderList.length === 0" class="py-3 sm:py-4 text-center text-gray-500">
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
  </div>

</template>

<script setup>
import Spinner from "@/components/common/Loading.vue";

const props = defineProps({
  orderList: {
    type: Array,
    default: () => []
  }
});

console.log("ChildOrders: props.orderList", props.orderList);


  </script>