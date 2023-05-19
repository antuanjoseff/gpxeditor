<template>
    <div class="q-gutter-sm"  v-if="info.distance">
        <div class="graph-header">
            <div class="flex">
                <div class="text-bold q-mr-md">
                  <q-icon class="toc-layer-icon right" name="directions_walk"/>
                  Distance
                </div>

                <div class="text-color" v-if="info.distance">
                  {{ info.distance.kms }} kms {{ info.distance.meters }} m
                </div>

                <div class="text-weight-bold q-mx-md q-pl-md vertical-line">
                  <q-icon class="toc-layer-icon right" name="query_builder"/>
                  Time
                </div>

                <div class="text-color" v-if="info.time">
                  {{ info.time.hours }}h  {{ info.time.minutes }}m {{ info.time.seconds }}s
                </div>

                <div class="text-weight-bold q-mx-md">
                  <q-icon class="toc-layer-icon right" name="speed"/>
                  Avg
                </div>

                <div v-if="info.time">{{ (3.6 * (info.distance.total / info.time.total)).toFixed(2) }} km/h
                </div>

                <div class="text-weight-bold q-ml-md q-px-md vertical-line">
                  <q-icon
                      class="toc-layer-icon right"
                      name="terrain"
                    />
                  Elevation
                </div>
                <div v-if="info.elevation" class="flex">
                  <div class="q-mx-sm">
                    {{ info.elevation.up }} m
                    <q-icon class="toc-layer-icon" name="trending_up"/>
                  </div>

                  <div class="q-mx-sm">
                      {{ info.elevation.down }} m
                      <q-icon class="toc-layer-icon" name="trending_down"/>
                  </div>

                  <div class="q-mx-sm">
                    {{ info.elevation.maxEle }} m
                    <q-icon
                      class="toc-layer-icon"
                      name="vertical_align_top"
                    />
                  </div>

                  <div class="q-mx-sm">
                      {{ info.elevation.minEle }} m
                    <q-icon
                      class="toc-layer-icon"
                      name="vertical_align_bottom"
                    />
                  </div>
                </div>

                <div style="flex-grow: 1;" class="text-right">
                  <q-btn
                    v-if="activeTool=='info'"
                    color="white"
                    text-color="black"
                    label="Create Track"
                    @click="createTrack"
                  />

                  <q-btn
                    v-else
                    color="white"
                    text-color="black"
                    label="Cancel"
                    @click="cancelTrackProfile"
                  />
              </div>

              </div>
            </div>
        <q-card  v-if="info.distance" horizontal="true" class="flex">
          <q-card-section style="flex-grow: 1">
            <line-chart
              @overGraphic="overGraphic"
              @outGraphic="outGraphic"
            ></line-chart>
          </q-card-section>
        </q-card>
    </div>
  </template>

<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import LineChart from 'components/LineChart.vue'

export default defineComponent({

  name: 'ModalTrackInfo',
  emits: ['create-track', 'over-graphic'],
  components: { LineChart },
  setup(props, context){
    const $store = useStore()

    const activeTool = computed(() => {
      return $store.getters['main/activeTool']
    })

    const info = computed(() => {
      return $store.getters['main/getTrackInfo']
    })

    const createTrack = () => {
      context.emit('create-track', {
        data: info.value.data,
        name: info.value.name
      })
      $store.commit('main/setTrackInfo', {})
    }

    const overGraphic = (data) => {
      context.emit('over-graphic', data)
    }

    const outGraphic = (data) => {
      context.emit('out-graphic', data)
    }

    const cancelTrackProfile = () => {
      $store.commit('main/setTrackInfo', {})
      $store.commit('main/setActiveLayer', -1)
    }

    return {
      info,
      cancelTrackProfile,
      outGraphic,
      overGraphic,
      createTrack,
      activeTool,
      seamless: true
    }
  }
})
</script>

<style lang="scss">
.q-dialog__inner--minimized > div {
  min-width: 100%;
  max-height: 350px;
}
.bottom{
  bottom: 0px;
  left: 0px;
  right: 0px;
}
/* .right-top{
  top: 40px;
  left: 0px;
}

.right-top .absolute-full, .fullscreen, .fixed-full {
  top: 40px;
  right: 0;
  bottom: unset;
  left: unset;
} */
.text-color{
  color:rgb(74, 69, 78);
}
.thin-separator{
  height: 1px;
}
.section-separator{
  height: 3px;
  color:black;
}
.inverted{
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
.graph-header{
  background: #dadada;
  padding: 10px;
}
.graph-header .flex{
  align-items: baseline;
}
.vertical-line{
  border-left: thick solid $dark-page;
}

</style>
<s></s>