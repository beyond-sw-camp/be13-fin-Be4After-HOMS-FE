<template>
    <div>
        <Breadcrumb />

        <!-- ClientDetailFields 컴포넌트에 fields와 isEditable=true를 넘겨줍니다 -->
        <ClientDetailFields :fields="fields" :isEditable="true" :data="data" />

        <div class="flex justify-center w-2/3 m-auto my-4 gap-10">
            <button @click="submitNewContract" class="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">생성</button>
            <button @click="goBack" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">취소</button>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {useRouter} from "vue-router";
import ClientDetailFields from "@/components/common/ClientDetailFields.vue";
import apiClient from "@/api";
import Breadcrumb from "@/components/common/Breadcrumb.vue";

// 라우터 인스턴스
const router = useRouter();
const data = ref([]);

// fields 배열: key 값은 백엔드 API 스펙의 속성명과 반드시 일치해야 합니다.
// fields 배열: 'contractStartAt' 과 'contractStopAt' 항목은 type: 'date'
const fields = ref([
    {label: "파트너사명", key: "companyId", value: "", type: "text"},
    {label: "대표 담당자", key: "representManagerName", value: "", type: "text"},
    {label: "계약 품목", key: "productId", value: "", type: "text"},
    {label: "계약 시작 일자", key: "contractStartAt", value: "", type: "date"},
    {label: "계약 만료 일자", key: "contractStopAt", value: "", type: "date"},
    // {label: "분류", key: "categoryName", value: "", type: "text"},
]);

// 신규 계약 등록 (POST)
const submitNewContract = async () => {
    try {
        // fields 배열을 순회하여 payload 객체로 변환
        const payload = {};
        fields.value.forEach((field) => {
            if (field.type === "date") {
                // field.value === "2025-06-02" 와 같은 문자열이므로
                // 여기에 T00:00:00 을 붙여서 LocalDateTime 포맷으로 변경
                if (field.value) {
                    payload[field.key] = `${field.value}T00:00:00`;
                } else {
                    // 사용자가 날짜를 선택하지 않았다면 null 처리
                    payload[field.key] = null;
                }
            } else {
                payload[field.key] = field.value;
            }
        });

        console.log(payload);

        // POST 요청: /contract 엔드포인트 (필요하다면 베이스 URL 앞에 /api 등 붙이세요)
        await apiClient.post("/contract/", payload);

        alert("계약이 정상적으로 등록되었습니다.");
        router.push({name: "Contracts"});
    } catch (error) {
        console.error("등록 중 오류 발생:", error);
        alert("등록에 실패했습니다. 입력값을 확인하거나 서버 상태를 점검하세요.");
    }
};

// 데이터 가져오는 함수
const fetchData = async () => {
    try {
        const response = await apiClient.get(`/contract/data`);
        if (response.status === 200) {
            data.value = response.data.data;
            console.log(data.value);
        } else {
            alert(t("errors.fetch_data_failed"));
        }
    } catch (err) {
        console.error(err.response.data.message);
    }
};

// 뒤로 가기 (이전 페이지로 이동)
const goBack = () => {
    router.back();
};

// 컴포넌트가 마운트될 때 데이터 가져오기
onMounted(() => {
    fetchData();
});
</script>

<style scoped>
input[readonly] {
    background-color: transparent;
    cursor: default;
}
</style>
