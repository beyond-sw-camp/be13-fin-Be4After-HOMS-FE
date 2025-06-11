<template>
  <div class="search-bar">
    <div class="flex">
      <div class="relative">
        <select v-model="size" @change="emitSearch" class="select-box">
          <option v-for="item in sizeOptions" :key="item">{{ item }}</option>
        </select>
      </div>
      <div class="relative" v-if="postSortOptions.length > 1">
        <select v-model="postSortOption" @change="emitSearch" class="select-box">
          <option v-for="option in postSortOptions" :key="option.value" :value="option.value">{{ option.label }}
          </option>
        </select>
      </div>
      <div class="relative" v-if="selectOptions.length > 1">
        <select v-model="selectOption" class="select-box">
          <option v-for="option in selectOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </div>
    </div>
    <div class="relative block mt-2 sm:mt-0" v-if="searchFalse !== true">
      <input v-model="searchQuery" @keydown.enter="emitSearch" placeholder="검색어를 입력해주세요" class="search-input" />
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchBox",
  props: {
    // 기본 출력 개수
    sizeOptions: {
      type: Array,
      default: () => [10, 20, 30],
    },
    // 정렬 옵션
    postSortOptions: {
      type: Array,
      default: () => [{value: "LATEST", label: "최신순"}],
    },
    // 검색 옵션
    selectOptions: {
      type: Array,
      default: () => [{value: "", label: "전체"}],
    },
    searchFalse: {
      type: Boolean,
      default: false,
    }
  },
  // 기본 값
  data() {
    return {
      size: this.sizeOptions[0],
      postSortOption: this.postSortOptions[0].value,
      selectOption: this.selectOptions[0].value,
      searchQuery: "",
    };
  },
  // 부모에게 보내는 값
  methods: {
    emitSearch() {
      this.$emit("search", {
        size: this.size,
        postSortOption: this.postSortOption,
        selectOption: this.selectOption,
        searchQuery: this.searchQuery,
      });
    },
  },
};
</script>

<style scoped>
.select-box {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #cbd5e0;
  /* gray-400 */
  border-radius: 0.375rem;
  background-color: white;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 2.5rem;
  border: 1px solid #cbd5e0;
  /* gray-400 */
  border-radius: 0.375rem;
}
</style>
