<template>
  <div>
    <div class="w-full">
      <div class="h-max w-full m-0 items-start rounded-none flex flex-wrap gap-4 justify-between p-4">
        <div class="flex items-center w-full shrink-0 gap-3 md:w-max">
          <!-- 페이지네이션 크기 -->
          <div class="relative">
            <select v-model="size" @change="emitSearch"
              class="select-box aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-4 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
              <option v-for="item in sizeOptions" :key="item">{{ item }}</option>
            </select>
          </div>
          <!-- 정렬 옵션 -->
          <div class="relative" v-if="postSortOptions.length > 1">
            <select v-model="postSortOption" @change="emitSearch"
              class="select-box aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-4 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
              <option v-for="option in postSortOptions" :key="option.value" :value="option.value">{{
                option.label }}
              </option>
            </select>
          </div>
          <!-- 검색 옵션 -->
          <div class="relative" v-if="selectOptions.length > 1">
            <select v-model="selectOption"
              class="select-box aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-4 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
              <option v-for="option in selectOptions" :key="option.value" :value="option.value">{{
                option.label }}</option>
            </select>
          </div>
          <!-- 검색바 -->
          <div class="w-72">
            <div class="relative w-full">
              <input :placeholder="$t('placeholder.search_keyword')" type="text" v-model="searchQuery"
                @keydown.enter="emitSearch"
                class="w-full aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-8 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer" />
              <span
                class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-stone-600/70 peer-hover:text-stone-800 peer-focus:text-stone-800 dark:peer-hover:text-white dark:peer-focus:text-white transition-all duration-300 ease-in overflow-hidden w-5 h-5">
                <svg width="1.5em" height="1.5em" viewBox="0 0 24 24" stroke-width="1.5" fill="none"
                  xmlns="http://www.w3.org/2000/svg" color="currentColor" class="h-full w-full">
                  <path d="M17 17L21 21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
                  <path
                    d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z"
                    stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
              </span>
            </div>
          </div>

        </div>
        <div class="left-0 flex flex-nowrap gap-2">
          <button v-for="button in filteredButtons" :key="button.label" :class="button.color"
            class="text-white font-bold py-2 px-4 rounded text-sm flex items-center justify-center"
            @click="button.action()">
            <img v-if="button.iconPath" :src="button.iconPath" alt="" class="w-4 h-4 mr-2" />
            <span v-else-if="button.iconSvg" v-html="button.iconSvg"
              class="w-4 h-4 mr-2 flex items-center justify-center"></span>
            {{ button.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const selectedLang = ref(locale.value === 'ko' ? 'KOR' : 'ENG')

// 선택한 언어를 localstage에 저장 이래야 전역으로 언어선택한거 알수 있음
watch(selectedLang, (newLang) =>{
    const langCode = newLang === 'KOR' ? 'ko' : 'en'
    locale.value = langCode
    localStorage.setItem('selectedLang', langCode)
})

// Props 정의
const props = defineProps({
  // 기본 출력 개수
  sizeOptions: {
    type: Array,
    default: () => [10, 20, 30],
  },
  // 정렬 옵션
  postSortOptions: {
    type: Array,
    default: () => [{ value: "LATEST", label: "최신순" }],
  },
  // 검색 옵션
  selectOptions: {
    type: Array,
    default: () => [{ value: "", label: "전체" }],
  },
  searchFalse: {
    type: Boolean,
    default: false,
  },
  // 버튼 옵션
  buttons: {
    type: Array,
    default: () => []
  },
  // 유저 권한
  userRole: {
    type: Boolean,
    default: false // 기본값은 false
  },
});

// `computed`를 활용해 권한이 있는 버튼만 필터링
const filteredButtons = computed(() => {
  return props.buttons.filter(button => {
    // userRole이 true이면 allowedRoles가 'admin'인 버튼만 보이도록 함
    if (props.userRole === true) {
      return button.allowedRoles && button.allowedRoles.includes('admin'); // 예시: 'admin' 권한만 보이게 설정
    } else if (props.userRole === false){
      return button.allowedRoles && button.allowedRoles.includes('user');
    } else {
      // userRole이 false이면 allowedRoles가 없는 버튼은 항상 보이도록 함
      return !button.allowedRoles;
    }
  });
});

// Emit 정의
const emit = defineEmits(['search']);

// 반응형 데이터 정의
const size = ref(props.sizeOptions[0]);
const postSortOption = ref(props.postSortOptions[0].value);
const selectOption = ref(props.selectOptions[0].value);
const searchQuery = ref("");

// 부모에게 보내는 값
const emitSearch = () => {
  emit("search", {
    size: size.value,
    postSortOption: postSortOption.value,
    selectOption: selectOption.value,
    searchQuery: searchQuery.value,
  });
};
</script>