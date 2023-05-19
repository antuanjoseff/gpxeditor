<template>
  <canvas id="myChart"></canvas>
  <button
    @click="addData">
     New Data
  </button>
</template>

<script>
import { Line } from 'vue-chartjs'
import Chart from 'chart.js/auto';
import { onMounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default {
    name: 'MyChart',
    components: { },
    setup() {
      const data = {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: '',
          backgroundColor: 'green',
          fill: true,
          tension: 0.2,
          data: [12, 19, 3, 5, 2, 3],
          borderWidth: 0
        }]
      }
    
     const options = {
      elements: {
        point:{
          radius: 0
        }
      },
      scales: {
        y: {
          beginAtZero: true
        },
        x: {
          display: false
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }

    const newData = () => {
      const value = Math.floor(Math.random() * 20)
      data.datasets[0].data.push(value)
    }
    onMounted(() => {
      const ctx = document.getElementById('myChart');
      new Chart(ctx, {
        type: 'line',
        data,
        options
      })
    })
  
    return {
    data,
    options,
    newData
    }
  }
}  

</script>

<style>

</style>