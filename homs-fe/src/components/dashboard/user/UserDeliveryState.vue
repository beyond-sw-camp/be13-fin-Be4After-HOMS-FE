<template>
      <div class="w-full max-w-6xl min-h-[402px] p-8 bg-white border border-gray-300 rounded-3xl shadow-lg">
        <div class="flex items-center justify-between">
            <h5 class="text-xl font-bold leading-none text-gray-900 ">
                배송 현황
            </h5>
        </div>
        <div class="flex justify-center items-center min-h-full ">
            <div class="flex flex-wrap mx-auto space-x-2">
              <div class="flex items-center gap-2">
              <DeliveryStatusItem :icon="checklist" label="주문 확인" :count="0" size="user" />
                <img :src="arrow" alt="화살표" class="h-10 hidden sm:block" />
              </div>
              <div class="flex items-center gap-2">
                <DeliveryStatusItem :icon="box" label="배송 준비" :count="props.counts.BEFORE" size="user" />
                <img :src="arrow" alt="화살표" class="h-10 hidden sm:block" />
              </div>
              <div class="flex items-center gap-2">
                <DeliveryStatusItem :icon="truck" label="배송중" :count="props.counts.SHIPPING" size="user" />
                <img :src="arrow" alt="화살표" class="h-10 hidden sm:block" />
              </div>
              <div class="flex items-center gap-2">
                <DeliveryStatusItem :icon="deliverycomplete" label="배송 완료" :count="props.counts.COMPLETED" size="user" />
              </div>
          </div>
        </div>
    </div>
</template>

<script setup>
import DeliveryStatusItem from '../admin/DeliveryStatusItem.vue'

import checklist from '@/assets/delivery/checklist.svg'
import box from '@/assets/delivery/box.svg'
import deliverycomplete from '@/assets/delivery/deliverycomplete.svg'
import truck from '@/assets/delivery/truck.svg'
import arrow from '@/assets/delivery/arrow.svg'

const props = defineProps({
  counts: {
    type: Object,
    default: () => ({
      BEFORE: 0,
      SHIPPING: 0,
      COMPLETED: 0,
      COLLECT: 0
    })
  }
});

</script>
