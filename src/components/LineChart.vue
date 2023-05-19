<template>
  <div class="fit" v-if="elevationData">
    <line-chart
      id="profile-chart"
      :data="data"
      :options="options"
      height="250" class="fit"
      @mouseout="mouseOut"
    />
  </div>
</template>

<script>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Point,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

import { Line as LineChart } from 'vue-chartjs'
import { computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)


export default defineComponent({
  name: 'App',
  components: {
    LineChart
  },
  emits: ['overGraphic', 'outGraphic'],
  setup(props, { emit }) {
    const $store = useStore()
    const elevationData = computed(() => {
      if ($store.getters['main/graphData'].labels) {
        return $store.getters['main/graphData'].labels.length
      } else {
        return 0
      }
    })

    const data = computed(() => {
      return $store.getters['main/graphData']
    })

    const dataLabels = computed(() => {
      return JSON.parse(JSON.stringify($store.getters['main/graphData'].labels))
    })
  
    var ctx = document.getElementById('profile-chart');
    const options =  {
        responsive: true,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        maintainAspectRatio: false,
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
          mode: 'nearest',
          intersect: false,
          tooltip: {
            usePointStyle: true,
            callbacks: {
              label: function(tooltipItem) {
                return  tooltipItem.formattedValue+' m'
              },
              labelPointStyle: function(context) {
                return {
                  pointStyle: 'triangle',
                  rotation: 0
                };
              }
            }
          },
          legend: {
            display: false
          }
        }
    }
    
    const mouseOut = (e) => {
      emit('outGraphic')
    }

    options.plugins.tooltip.callbacks.title = function (tooltipItem) {
      const indexValue = tooltipItem[0].dataIndex
      const total  = parseInt(tooltipItem[0].label)
      const kms = Math.floor(total /  1000)
      const meters = Math.floor(total - (1000 * kms))
      let label = (kms) ? kms + ' kms - ' : ''
      label +=  meters + ' m'
      emit('overGraphic', indexValue)
      return label
    }.bind(self)


    return {
      data,
      mouseOut,
      options,
      elevationData
    }
  }
})
</script>
