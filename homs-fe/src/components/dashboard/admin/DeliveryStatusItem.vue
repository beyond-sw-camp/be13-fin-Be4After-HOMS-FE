<template>
  <div class="flex flex-col items-center">
    <div :class="circleClass">
      <div class="flex w-full items-center justify-center">
        <img :src="icon" :alt="label" :class="iconClass" />
      </div>
    </div>
    <div class="flex flex-col items-center mt-5 gap-5">
      <span :class="textClass">{{ label }}</span>
      <span :class="['font-bold', textClass]">{{ count }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'


const props = defineProps({
    icon: String,
    label: String,
    count: {
      type: Number,
      default: 0
    },
    size: {
      type: String,
      default: 'md', // sm | md | lg
    }
  })

  const circleClass = computed(() => {
  return {
    user: 'w-30 h-30',
    md: 'w-40 h-40',
  }[props.size] + ' bg-gray-300 rounded-full flex items-center justify-center'
  })

  const iconClass = computed(() => {
  return {
    user: 'w-15 h-15',
    md: 'w-20 h-20',
  }[props.size]
  })

const textClass = computed(() => {
  return {
    user: 'text-md font-bold',
    md: 'text-xl',
  }[props.size]
})
  </script>