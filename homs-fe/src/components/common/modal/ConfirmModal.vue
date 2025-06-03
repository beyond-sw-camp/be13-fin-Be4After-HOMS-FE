<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-gray-900 opacity-60"></div>

        <div class="relative bg-white shadow-lg w-full max-w-md text-center z-10 pb-5">
            <div class="flex justify-end bg-slate-700 text-xl font-semibold mb-4 p-2">
                <img :src="xmark" alt="엑스마크" class="w-5 h-5 cursor-pointer" @click="handleCancel">
            </div>
            <div class="flex justify-center">
                <div class="flex justify-center"><img :src="error" alt="정보아이콘" class=""></div>
                <p class=" p-6 text-gray-700 font-bold text-l" v-html="text"></p>
            </div>
            <div v-if="!alert" class="pt-5">
                <button @click="handleConfirm(type)"
                    class="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm mr-2 cursor-pointer">확인</button>
                <button @click="handleCancel"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm cursor-pointer">취소</button>
            </div>
            <div v-else class="pt-5">
                <button @click="handleCancel"
                    class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm cursor-pointer">확인</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import xmark from '@/assets/xmark.svg'
import error from '@/assets/error.svg'

const props = defineProps({
    visible: Boolean,
    alert: {
        type: Boolean,
        default: false,
    },
    text: {
        type: String,
        default: '임의의 텍스트',
    },
    type: {
        type: String,
        default: null,
    },
    
})

// 부모에게 보낼 값
const emit = defineEmits(['update:visible', 'confirm', 'cancle'])

// 확인 버튼을 누르면 동작
const handleConfirm = (type) => {
    // onConfirm prop으로 받은 함수를 호출합니다.
    emit('confirm', type); // boolean 값 보냄
    emit('update:visible', false); // 모달 닫기
}

// 취소 버튼 (및 X 마크)을 누르면 모달 닫고 초기화
const handleCancel = () => {
    emit('update:visible', false);
    emit('cancle', null);
}
</script>