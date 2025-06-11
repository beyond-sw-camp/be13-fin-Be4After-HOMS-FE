<template>
    <div class="flex flex-col max-w-1/2 m-auto rounded-xl py-5 border-1 border-gray-400 shadow">
        <div class="flex w-2/3 m-auto mb-3" v-for="(item, index) in fields" :key="index">
            <div class="flex border-gray-400 border w-1/2 p-2 font-bold bg-gray-200">
                {{ item.label }}
            </div>
            <div v-if="!data" class="flex border-gray-400 border w-1/2 p-2 font-bold">
                <input
                    :type="item.key === 'password' ? 'password' : 'text'"
                    v-model="item.value"
                    :readonly="!isEditable || !editableKeys.includes(item.key)"
                    :class="[
                        'w-full outline-none',
                        isEditable && editableKeys.includes(item.key)
                        ? 'bg-[#fdf6e3] border border-gray-400'
                        : 'bg-transparent'
                    ]"/>
                </div>
            <div v-else class="flex border-gray-400 border w-1/2 p-2 font-bold">
                <!-- 파트너사 명 -->
                <select v-if="item.key === `companyId`" v-model="item.value" :class="['w-full outline-none', isEditable ? 'bg-[#fdf6e3] border border-gray-400' : 'bg-transparent']">
                    <option value="" disabled>선택하세요</option>
                    <option v-for="company in data.companyList" :key="company.id" :value="company.id">
                        {{ company.companyName }}
                    </option>
                </select>
                <!-- 대표 담당자 -->
                <input
                    v-if="item.key === `representManagerName`"
                    v-model="item.value"
                    type="text"
                    readonly="true"
                    :class="['w-full outline-none', isEditable ? 'bg-[#fdf6e3] border border-gray-400' : 'bg-transparent']"
                />

                <!-- 계약 품목 -->
                <select v-if="item.key === `productId`" v-model="item.value" :class="['w-full outline-none', isEditable ? 'bg-[#fdf6e3] border border-gray-400' : 'bg-transparent']">
                    <option value="" disabled>선택하세요</option>
                    <option v-for="product in data.productList" :key="product.id" :value="product.id">{{ product.category }} | {{ product.name }}</option>
                </select>

                <!-- 계약 시작 / 만료 -->
                <input
                    type="date"
                    v-if="item.key === `contractStartAt` || item.key === `contractStopAt`"
                    v-model="item.value"
                    :readonly="!isEditable"
                    :class="['w-full outline-none', isEditable ? 'bg-[#fdf6e3] border border-gray-400' : 'bg-transparent']"
                />
            </div>
        </div>

        <!-- 계약 기간 필드 (필요 시만 표시) -->
        <div v-if="contractPeriod" class="flex w-2/3 m-auto mb-3">
            <div class="flex border-gray-400 border w-1/2 p-2 font-bold bg-gray-200">계약 기간</div>
            <div class="flex border-gray-400 border w-1/2 p-2 font-bold">
                <input type="text" v-model="contractPeriodModel" :readonly="!isEditable" :class="['w-full outline-none', isEditable ? 'bg-[#fdf6e3] border border-gray-400' : 'bg-transparent']" />
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, ref, watch} from "vue";

const editableKeys = ['managerName', 'managerEmail', 'managerPhone', 'password'];


const props = defineProps({
    fields: {
        type: Object,
        required: true,
    },
    isEditable: {
        type: Boolean,
        default: false,
    },
    contractPeriod: {
        type: String,
        default: "",
    },
    data: {
        type: Object,
    },
});

// `companyName` select에서 선택된 회사 이름을 감지하는 watch
watch(
    () => {
        // fields 배열에서 item.key가 'companyName'인 객체의 value를 감시
        const companyField = props.fields.find((field) => field.key === "companyId");
        return companyField ? companyField.value : null;
    },
    (newCompanyId) => {
        // newCompanyName이 변경될 때마다 대표 담당자 이름 업데이트 로직 호출
        updateRepresentManagerNameByCompanyName(newCompanyId);
    }
);

// 파트너사 명 선택 시 대표 담당자 이름을 업데이트하는 함수
const updateRepresentManagerNameByCompanyName = (selectedCompanyId) => {
    // 인자 이름도 명확히 변경
    const managerField = props.fields.find((field) => field.key === "representManagerName");

    if (managerField && props.data && props.data.companyList) {
        const foundCompany = props.data.companyList.find((company) => company.id === selectedCompanyId);

        if (foundCompany) {
            managerField.value = foundCompany.representManagerName;
        } else {
            managerField.value = ""; // 선택된 회사가 없으면 빈 값으로
        }
    }
};

const emit = defineEmits(["update:contractPeriod"]);

const contractPeriodModel = ref(props.contractPeriod);

watch(contractPeriodModel, (val) => {
    emit("update:contractPeriod", val);
});
</script>

<style scoped>
input[readonly] {
    background-color: transparent;
    cursor: default;
}
</style>
