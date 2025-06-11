<template>
    <div class="flex-col w-full max-w-4xl p-8 bg-white border border-gray-300 rounded-3xl shadow-lg">
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900">거래처별 거래 현황</h5>
        </div>
        <Bar :options="chartOptions" :data="chartData" :width="700" :height="300" class="mx-auto" />
    </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend} from "chart.js";
import {Chart, Bar} from "vue-chartjs";
import apiClient from "@/api";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const chartData = ref({
    labels: [],
    datasets: [],
});

const chartOptions = {
    responsive: true,
    scales: {
        x: {
            stacked: false,
        },
        y: {
            beginAtZero: true,
        },
    },
    plugins: {
        legend: {
            position: "top",
        },
    },
};

onMounted(async () => {
    const params = {
        size: 10000,
    };
    try {
        const response = await apiClient.get(`/order/`, {
            params: params, // 여기에 구성한 파라미터 객체를 전달합니다.
        });
        const orders = response.data.data.content;
        console.log("orders", orders);

        const currentYear = new Date().getFullYear(); // 2025
        const companyMap = new Map();

        orders.forEach((order) => {
            const year = new Date(order.orderDate).getFullYear();
            console.log("year", year);
            const company = order.companyName;

            if (!companyMap.has(company)) {
                companyMap.set(company, {[currentYear]: 0, [currentYear - 1]: 0});
            }

            if (year === currentYear) {
                companyMap.get(company)[currentYear]++;
            } else if (year === currentYear - 1) {
                companyMap.get(company)[currentYear - 1]++;
            }
        });

        const labels = Array.from(companyMap.keys());
        console.log("labels", labels);
        const lastYearData = labels.map((name) => companyMap.get(name)[currentYear - 1]);
        const thisYearData = labels.map((name) => companyMap.get(name)[currentYear]);

        chartData.value = {
            labels,
            datasets: [
                {
                    label: `${currentYear - 1}년 거래`,
                    backgroundColor: "#bca79d",
                    data: lastYearData,
                },
                {
                    label: `${currentYear}년 거래`,
                    backgroundColor: "#F16203",
                    data: thisYearData,
                },
            ],
        };
    } catch (error) {
        console.error("API 에러:", error);
    }
});
</script>
