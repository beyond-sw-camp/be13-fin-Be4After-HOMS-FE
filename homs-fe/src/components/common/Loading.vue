<template>
    <div class="spinner-container" v-if="visible">
        <div class="spinner"></div>
        <p v-if="message">{{ message }}</p>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps({
    visible: {
        type: Boolean,
        default: false,
    },
    message: {
        type: String,
        default: "로딩 중...",
    },
});
</script>

<style scoped>
.spinner-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /* 부모 요소에 position: relative; 가 설정되어 있다면,
       자식 요소에 position: absolute; 를 사용하여 부모 영역만 덮을 수 있습니다. */
    position: absolute;
    /* 또는 fixed, 필요에 따라 */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    /* 배경을 밝게 조정 */
    z-index: 5;
    /* 전역 로딩보다 낮게 */
    color: #333;
    border-radius: 8px;
    /* 부모 컴포넌트의 border-radius와 일치 */
}

.spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid orangered;
    /* Vue 색상 */
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

p {
    font-size: 0.9em;
}
</style>
