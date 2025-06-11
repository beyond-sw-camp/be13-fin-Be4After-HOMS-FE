<template>
    <div class="flex flex-col w-full min-h-[402px] p-8 bg-white border border-gray-300 rounded-3xl shadow-lg">
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900">배송 현황</h5>
        </div>
        <div class="flex-grow flex justify-center items-center overflow-x-auto">
            <div class="flex flex-nowrap justify-between items-center gap-2 sm:gap-4 md:gap-6 min-w-max">
                <DeliveryStatusItem :icon="checklist" label="납품 확인" :count="0" class="flex-auto min-w-0" />

                <img :src="arrow" alt="화살표" class="h-6 sm:h-8 md:h-10 my-auto mb-38 flex-shrink-0" />

                <DeliveryStatusItem :icon="box" label="배송 준비" :count="props.counts.BEFORE" class="flex-auto min-w-0" />
                <img :src="arrow" alt="화살표" class="h-6 sm:h-8 md:h-10 my-auto mb-38 flex-shrink-0" />

                <DeliveryStatusItem :icon="truck" label="배송중" :count="props.counts.SHIPPING" class="flex-auto min-w-0" />
                <img :src="arrow" alt="화살표" class="h-6 sm:h-8 md:h-10 my-auto mb-38 flex-shrink-0" />

                <DeliveryStatusItem :icon="deliverycomplete" label="납품 완료" :count="props.counts.COMPLETED" class="flex-auto min-w-0" />
                <img :src="arrow" alt="화살표" class="h-6 sm:h-8 md:h-10 my-auto mb-38 flex-shrink-0" />

                <DeliveryStatusItem :icon="collect" label="회수" :count="props.counts.COLLECT" class="flex-auto min-w-0" />
            </div>
        </div>
    </div>
</template>
<script setup>
import DeliveryStatusItem from "./DeliveryStatusItem.vue";

import checklist from "@/assets/delivery/checklist.svg";
import box from "@/assets/delivery/box.svg";
import collect from "@/assets/delivery/collect.svg";
import deliverycomplete from "@/assets/delivery/deliverycomplete.svg";
import truck from "@/assets/delivery/truck.svg";
import arrow from "@/assets/delivery/arrow.svg";

const props = defineProps({
    counts: {
        type: Object,
        default: () => ({
            BEFORE: 0,
            SHIPPING: 0,
            COMPLETED: 0,
            COLLECT: 0,
        }),
    },
});
</script>
