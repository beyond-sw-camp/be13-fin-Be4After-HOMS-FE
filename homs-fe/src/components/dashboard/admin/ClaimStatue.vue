<template>
    <div class="w-full max-w-md p-4 bg-white border border-gray-300 rounded-3xl shadow-lg sm:p-8">
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900 ">
                클래임 관리
            </h5>
            <a @click.prevent="goToClaim" class="text-sm font-medium hover:underline ">
                +
            </a>
        </div>
        <!-- 카드 내용 부분 -->
        <div class="flow-root">
            <ul role="list" class="divide-y divide-gray-200 content-center flex-col w-full">
                <li v-for="(item, index) in claimlist" :key="index" class="py-3">
                    <div class="flex ">
                        <div class="flex w-2/3 ms-4 py-5">
                            <p class="flex text-xl font-bold text-gray-900 truncate">
                                {{ item.name }}
                            </p>
                        </div>
                        <div class="flex w-1/3 justify-end items-center font-semibold text-gray-900 mr-5">
                            {{ item.num.toLocaleString()}}
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>

import { ref, onMounted   } from 'vue'
import { useClaimStore } from '@/states/claim'
import { useRouter } from 'vue-router'

const claimStore = useClaimStore()
const router = useRouter()

function goToClaim() {
  router.push("/claims")
}

const claimlist = ref([
  { name: '취소', num: 0 },
  { name: '교환', num: 0 },
  { name: '완료', num: 0 },
])

onMounted(async () => {
  await claimStore.fetchClaimSummary()
  claimlist.value = [
    { name: '취소', num: claimStore.claimSummary.cancel },
    { name: '교환', num: claimStore.claimSummary.exchange },
    { name: '완료', num: claimStore.claimSummary.complete },
  ]
})



</script>
