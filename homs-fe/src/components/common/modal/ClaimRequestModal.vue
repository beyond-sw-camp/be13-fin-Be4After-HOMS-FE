<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-gray-900 opacity-60"></div>

        <div class="relative bg-white shadow-lg w-full max-w-md text-center z-10 pb-5">
            <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-4 p-2">
                <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="handleCancel" />
            </div>
            <!-- 본문 -->
            <div class="pr-8 pl-8">
                <div class="flex">
                    <p class="p-3 pl-0 text-gray-700 font-bold text-lg" v-html="text"></p>
                </div>
                <div class="gap-5">
                    <!-- 납품위치 (수정) -->
                    <div class="flex flex-col gap-1 w-full md:w-auto">
                        <label class="text-left block text-gray-700 font-semibold">교환 사유</label>
                        <select v-model="selectedOption"
                            class="select-box aria-disabled:cursor-not-allowed outline-none focus:outline-none text-stone-800 dark:text-black placeholder:text-stone-600/60 ring-transparent border border-stone-200 transition-all ease-in disabled:opacity-50 disabled:pointer-events-none select-none text-sm py-2 pr-4 pl-2.5 ring shadow-sm bg-white rounded-lg duration-100 hover:border-stone-300 hover:ring-none focus:border-stone-400 focus:ring-none peer">
                            <option disabled value="">선택</option>
                            <option v-for="option in claimOptions" :key="option.value" :value="option.value">{{
                                option.label }}</option>
                        </select>
                    </div>
                    <div class="flex flex-col gap-1 w-full md:w-auto pt-3">
                        <label class="text-left block text-gray-700 font-semibold">상세사유</label>
                        <textarea v-model="inputValue" placeholder="사유를 적어주세요"
                            class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            rows="4"></textarea>
                    </div>
                </div>
            </div>

            <!-- 버튼들 -->
            <div class="pt-5">
                <button @click="handleConfirm"
                    class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2 cursor-pointer">확인</button>
                <button @click="handleCancel"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm cursor-pointer">취소</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref} from "vue";
import xmark from "@/assets/xmark.svg";

const props = defineProps({
    visible: Boolean,
    text: {
        type: String,
        default: "임의의 텍스트",
    },
    claimOptions: {
        type: Array,
        default: () => [
            {
                value: "DEFECTIVE",
                label: "제품 불량",
            },
            {
                value: "DAMAGE",
                label: "제품 파손",
            },
            {
                value: "DISSATISFIED",
                label: "품질 불만족",
            },
            {
                value: "OTHER",
                label: "기타",
            },
        ],
    },
});

// textarea의 내부 상태 관리
const selectedOption = ref("");
const inputValue = ref(props.inputValue);

// 부모에게 보낼 값
const emit = defineEmits(["update:visible", "confirm", "cancel"]);

// 확인 버튼을 누르면 동작
const handleConfirm = () => {
    // onConfirm prop으로 받은 함수를 호출합니다.
    emit("confirm", selectedOption.value, inputValue.value);
    emit("update:visible", false); // 모달 닫기
};

// 취소 버튼 (및 X 마크)을 누르면 모달 닫고 초기화
const handleCancel = () => {
    emit("update:visible", false);
    selectedOption.value = "";
    inputValue.value = "";
};
</script>