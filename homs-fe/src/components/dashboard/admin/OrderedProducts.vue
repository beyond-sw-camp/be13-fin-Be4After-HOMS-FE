<template>
    <div class="w-full max-w-md p-4 bg-white border border-gray-300 rounded-3xl shadow-lg sm:p-8">
        <!-- 카드 헤더 -->
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900 ">
                상위 주문 상품
            </h5>
            <a @click.prevent="goToOrderForm" class="text-sm font-medium hover:underline ">
                +
            </a>
        </div>
        <!-- 카드 내용 부분 -->
        <div class="flow-root">
            <ul role="list" class="divide-y divide-gray-200">
                <li v-for="(item, index) in productList" :key="index" class="py-3 sm:py-4">
                    <div class="flex items-center">
                        <div class="flex w-2/3 ms-4 justify-between">
                            <p class="flex text-md  font-semibold text-gray-900 truncate">
                                {{ item.name }}
                            </p>
                        </div>
                        <div class="flex w-1/3 pr-5 justify-end items-center font-semibold text-gray-900">
                            {{ item.price.toLocaleString() }}건
                        </div>
                    </div>
                </li>
            </ul>
        </div>

    </div>

</template>

<script setup>
// 나중에 DB에서 받아서 할 예정
// const productList = ref([
//   { name: 'LDPE-303', price: 5230000 },
//   { name: 'LDPE-950', price: 3230000 },
//   { name: 'EVA-303', price: 2230000 },
//   { name: 'LLDPE-3120', price: 1930000 },
//   { name: 'HDPE', price: 920000 },
// ])

import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const productList = ref([])
const router = useRouter()

function goToOrderForm() {
  router.push("/orders")
}


onMounted(async () => {
  try {
    const token = localStorage.getItem("accessToken")
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/orderitem/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const rawData = response.data.data

    const quantityMap = {}
    rawData.forEach(item => {
      const name = item.product.productName
      const quantity = item.quantity
      quantityMap[name] = (quantityMap[name] || 0) + quantity
    })

    const topProducts = Object.entries(quantityMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    productList.value = topProducts.map(p => ({
      name: p.name,
      price: p.quantity
    }))
  } catch (err) {
    console.error('데이터 조회 실패:', err)
  }
})





</script>
