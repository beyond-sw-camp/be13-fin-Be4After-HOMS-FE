<template>
    <div class="w-full max-w-md p-4 bg-white border border-gray-300 rounded-3xl shadow-lg sm:p-8">
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900">분야별 주문 현황</h5>
        </div>
        <div>
            <Pie :options="chartOptions" :data="chartData" />
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from "chart.js";
import {Pie} from "vue-chartjs";
import apiClient from "@/api";
ChartJS.register(ArcElement, Tooltip, Legend);

const chartData = ref({
    labels: ["LDPE", "LDPE-950", "EVA-1125", "AngularJs"],
    datasets: [
        {
            backgroundColor: ["#41B883", "#E46651", "#00D8FF", "#DD1B16"],
            data: [40, 20, 80, 10],
        },
    ],
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
};

function calculateCategoryQuantities(data) {
    const categoryMap = new Map();

    data.forEach((item) => {
        const categoryName = item.product.category.productCategory || "기타";
        const quantity = item.quantity;

        if (categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, categoryMap.get(categoryName) + quantity);
        } else {
            categoryMap.set(categoryName, quantity);
        }
    });

    return categoryMap;
}

onMounted(async () => {
    try {
        const response = await apiClient.get(`orderitem/`);

        const orderItems = response.data.data;
        const categoryMap = calculateCategoryQuantities(orderItems);

        const labels = Array.from(categoryMap.keys());
        const values = Array.from(categoryMap.values());

        chartData.value = {
            labels,
            datasets: [
                {
                    backgroundColor: ["#41B883", "#E46651", "#00D8FF", "#DD1B16", "#F5A623", "#7B68EE"],
                    data: values,
                },
            ],
        };
    } catch (error) {
        console.error("API 호출 에러:", error);
    }
});
</script>
