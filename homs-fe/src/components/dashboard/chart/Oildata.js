export const chartData = {
  labels: [
    '5/1', '5/2', '5/5', '5/6', '5/7', '5/8', '5/9',
    '5/12', '5/13', '5/14', '5/15', '5/16', '5/19',
    '5/20', '5/21', '5/22'
  ],
  datasets: [
    {
      type: 'line',
      label: 'Brent',
      borderColor: '#FF5733',
      backgroundColor: 'transparent',
      data: [
        62.13, 61.29, 60.23, 62.15, 61.12, 62.84, 63.91,
        64.96, 66.63, 66.09, 64.53, 65.41, 65.54,
        65.38, 64.91, 64.44
      ],
    },
    {
      type: 'line',
      label: 'WTI',
      borderColor: '#3375FF',
      backgroundColor: 'transparent',
      data: [
        59.24, 58.29, 57.13, 59.09, 58.07, 59.91, 61.02,
        61.95, 63.67, 63.15, 61.62, 62.49, 62.69,
        62.56, 61.57, 61.20
      ],
    },
    {
      type: 'line',
      label: 'Dubai',
      borderColor: '#28A745',
      backgroundColor: 'transparent',
      data: [
        null, 62.00, 59.56, 61.70, 63.62, 62.17, 63.91,
        null, 65.27, 66.01, 63.70, 63.78, 64.24,
        64.99, 66.04, 63.75
      ],
    },
    {
      type: 'line',
      label: 'Oman',
      borderColor: '#FFC107',
      backgroundColor: 'transparent',
      data: [
        null, 62.00, 59.56, 61.70, 63.62, 62.16, 63.91,
        null, 65.27, 66.01, 63.69, 63.77, 64.23,
        64.98, 66.03, 63.73
      ],
    },
  ]
}

export const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: '국제 유가 동향',
    },
  },
  scales: {
    y: {
      min: 0,
      max: 70,
      ticks: {
        stepSize: 10, // 눈금 간격 설정 (선택 사항)
      },
    },
  },
}
