<template>
  <div class="flex flex-col items-center px-5 py-5 bg-white sm:flex-row sm:justify-center">
    <div class="flex mr-4 rounded">
      <button @click="goToFirstPage()"
        class="px-3 py-2 leading-tight text-black-700 bg-white border border-r-0 border-gray-200 rounded-l hover:bg-orange-500 hover:text-white disabled:opacity-50"
        :disabled="currentPage === 1">
        <span>&lt;&lt;</span>
      </button>
      <button @click="prevPage()"
        class="px-3 py-2 leading-tight text-black-700 bg-white border border-r-0 border-gray-200 hover:bg-orange-500 hover:text-white disabled:opacity-50"
        :disabled="currentPage === 1">
        <span>&lt;</span>
      </button>
      <template v-for="(page, index) in displayedPages">
        <button v-if="typeof page === 'number'" @click="setPage(page)" :class="[
          'w-10',
          'px-3',
          'py-2',
          'leading-tight',
          'bg-white',
          'border',
          'border-r-0',
          'border-gray-200',
          'hover:bg-orange-500',
          'hover:text-white',
          { 'bg-orange-500 text-orange-500': page === currentPage },
        ]" :key="page">
          <span>{{ page }}</span>
        </button>
        <span v-else class="px-3 py-2 leading-tight text-gray-500" :key="'ellipsis-' + index">
          ...
        </span>
      </template>
      <button @click="nextPage()"
        class="px-3 py-2 leading-tight text-black-700 bg-white border border-r-0 border-gray-200 hover:bg-orange-500 hover:text-white disabled:opacity-50"
        :disabled="currentPage === totalPages">
        <span>&gt;</span>
      </button>
      <button @click="goToLastPage()"
        class="px-3 py-2 leading-tight text-black-700 bg-white border border-gray-200 rounded-r hover:bg-orange-500 hover:text-white disabled:opacity-50"
        :disabled="currentPage === totalPages">
        <span>&gt;&gt;</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  maxVisiblePages: {
    type: Number,
    default: 10, // 보여줄 페이지 번호 개수 (고정값)
  },
});

const emit = defineEmits(['set-page']);

const setPage = (page) => {
  emit('set-page', page);
};

// 이전 페이지
const prevPage = () => {
  if (props.currentPage > 1) {
    emit('set-page', props.currentPage - 1);
  }
};

// 다음 페이지
const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('set-page', props.currentPage + 1);
  }
};

// 첫 페이지로
const goToFirstPage = () => {
  emit('set-page', 1);
};

// 마지막 페이지로
const goToLastPage = () => {
  emit('set-page', props.totalPages);
};

const displayedPages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const current = props.currentPage;
  const visibleCount = props.maxVisiblePages; // 10개로 고정
  const halfVisible = Math.floor(visibleCount / 2);

  let start = Math.max(1, current - halfVisible);
  let end = Math.min(total, current + halfVisible - (visibleCount % 2 === 0 ? 1 : 0));

  // 개수를 정확히 10개로 맞춤
  while (end - start + 1 < visibleCount) {
    if (start > 1) {
      start--;
    } else if (end < total) {
      end++;
    } else {
      break;
    }
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

</script>