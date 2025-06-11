<template>
    <div class="flex-col w-full max-w-4xl p-8 bg-white border border-gray-300 rounded-3xl shadow-lg">
        <div class="flex items-center justify-between mb-4">
            <h5 class="text-xl font-bold leading-none text-gray-900 ">
                국제 유가 동향
            </h5>
        </div>
        <Bar :options="chartOptions" :data="chartData" :width="700" :height="300" class="mx-auto" />
    </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs';
import { ref } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement ,CategoryScale, LinearScale, plugins, LineElement, PointElement } from 'chart.js'
import { chartData as rawData, chartOptions } from '@/components/dashboard/chart/Oildata.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale,PointElement, LineElement)

const chartData = ref(rawData)

</script>