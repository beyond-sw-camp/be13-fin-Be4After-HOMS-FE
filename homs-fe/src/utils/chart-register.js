    // src/plugins/chart-register.js
import {
    Chart as ChartJS,
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    BarController,
    LineController
  } from 'chart.js'
  
  ChartJS.register(
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    BarController,
    LineController
  )
  