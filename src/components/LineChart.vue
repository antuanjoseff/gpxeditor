<template>
  <div class="fit padding-canvas" v-if="elevationData">
    <line-chart
      id="profile-chart"
      :data="data"
      :options="options"
      :plugins="plugins"
      :height="graphHeight" class="fit"
      @mouseout="mouseOut"
    />
  </div>
</template>

<script>
import { Line as LineChart } from 'vue-chartjs'
import { ref, computed, defineComponent } from 'vue'
import { useStore } from 'vuex'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)


export default defineComponent({
  name: 'App',
  components: {
    LineChart
  },
  props: ['height'],
  emits: ['overGraphic', 'outGraphic'],
  setup(props, { emit }) {
    const $store = useStore()

    const graphHeight = computed(() => {
      return props.height
    })
    
    const plugins = ref()
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

    const externalTooltipHandler = (context) => {
      // Tooltip Element
      const {chart, tooltip} = context;
      if (chart.tooltip._active && chart.tooltip._active.length) {
        const activePoint = chart.tooltip._active[0]
        const data = tooltip.dataPoints[0]
        doTooltip(data)
      }
    }

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
          enabled: false,
          usePointStyle: true,
          external: externalTooltipHandler
        },
        legend: {
          display: false
        }
      }
    }

    const tooltipLine = {
      id: 'tooltipLine',
      afterDraw: chart => {
        if (chart.tooltip._active && chart.tooltip._active.length) {
          const ctx = chart.ctx
          ctx.save()
          const activePoint = chart.tooltip._active[0]
          ctx.beginPath()
          ctx.setLineDash([5, 7])
          ctx.moveTo(activePoint.element.x, 0)
          ctx.lineTo(activePoint.element.x, chart.chartArea.bottom)
          ctx.lineWidth = 2
          ctx.strokeStyle = 'rbg(255,0,0,0.5)'
          ctx.stroke()
          ctx.restore()
        }
      }
    }
    plugins.value = [tooltipLine]

    const mouseOut = (e) => {
      emit('outGraphic')
    }

    const doTooltip = (data) => {
      const indexValue = data.dataIndex
      const total  = parseInt(data.label)
      const kms = Math.floor(total /  1000)
      const meters = Math.floor(total - (1000 * kms))
      let label = (kms) ? kms + ' kms - ' : ''
      label +=  meters + ' m'
      document.getElementById('tooltip-footer').innerHTML = label
      document.getElementById('tooltip-footer').style.marginLeft = data.element.x +'px'
      document.getElementById('tooltip-header').innerHTML = data.formattedValue + ' m'
      document.getElementById('tooltip-header').style.marginLeft = data.element.x +'px'
      emit('overGraphic', indexValue)
    }

    return {
      data,
      mouseOut,
      plugins,
      options,
      elevationData,
      graphHeight
    }
  }
})
</script>
<style scoped>
.padding-canvas{
  padding-top: 0px;
}
</style>
