<template>
    <div class="flex-col w-full max-w-4xl p-8 bg-white border border-gray-300 rounded-3xl shadow-lg">
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900">월별 매출 현황</h5>
            <div class="flex items-center space-x-3">
                <button @click="changeYear(-1)" :disabled="selectedYear <= minYear"
                    class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    &lt;
                </button>
                <span class="text-lg font-semibold text-gray-900">{{ selectedYear }}년</span>
                <button @click="changeYear(1)" :disabled="selectedYear >= maxYear"
                    class="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    &gt;
                </button>
            </div>
        </div>
        <Bar :options="chartOptions" :data="chartData" :width="700" :height="300" class="mx-auto" />
    </div>
</template>

<script setup>
import {ref, onMounted, reactive} from "vue";
import {Bar} from "vue-chartjs";
import {Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale} from "chart.js";
import apiClient from "@/api";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const labels = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

const chartData = ref({
    labels,
    datasets: [
        {
            type: "bar",
            label: "매출",
            backgroundColor: "#F16203",
            data: [],
        },
    ],
});

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: "none",
        },
        title: {
            display: false,
            text: "월별 매출",
        },
    },
};

const selectedYear = ref(2025); // 시작 연도를 2025년으로 고정
const minYear = 2024; // 최소 연도
const maxYear = 2025; // 최대 연도 (필요에 따라 더 추가 가능)
const allOrderItems = ref([]); // 모든 주문 데이터를 저장할 ref

function calculateMonthlySales(data, year) {
    const monthlySales = Array(12).fill(0);
    data.forEach((item) => {
        const date = new Date(item.order.orderDate);
        const itemYear = date.getFullYear();
        if (itemYear === year) {
            const month = date.getMonth();
            monthlySales[month] += item.quantity;
        }
    });
    return monthlySales;
}

// 연도를 변경하고 데이터를 업데이트하는 함수
function changeYear(offset) {
    const newYear = selectedYear.value + offset;
    if (newYear >= minYear && newYear <= maxYear) {
        selectedYear.value = newYear;
        updateChartData(); // 연도 변경 후 차트 데이터 업데이트
    }
}

// 현재 선택된 연도에 따라 차트 데이터를 업데이트하는 함수
function updateChartData() {
    const monthlySales = calculateMonthlySales(allOrderItems.value, selectedYear.value);
    chartData.value = {
        labels,
        datasets: [
            {
                type: "bar",
                label: "매출",
                backgroundColor: "#F16203",
                data: monthlySales,
            },
        ],
    };
}

onMounted(async () => {
    try {
        const response = await apiClient.get(`orderitem/`);
        allOrderItems.value = response.data.data; // 모든 데이터를 저장

        // 초기 로드 시 시작 연도 (2024년) 데이터로 차트 업데이트
        updateChartData();
    } catch (error) {
        console.error("API 호출 에러:", error);
    }
});
</script>
