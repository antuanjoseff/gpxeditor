
<template>
  <div v-if="data.length">
    <draggable
      v-model="data"
      item-key="id"
      handle=".handle"
      ghost-class="ghost"
      animation=450
    >
      <template #item="{ element }">
        <div class="drag-item" :class="element.active?'active':''" @click="setActiveLayer(element.id)">
          <q-item tag="div" v-ripple>
            <div class="flex fit col items-center">
              <div class="flex fit q-mb-sm">
                <div style="flex-grow:1">
                  <q-item-label
                    caption
                    class="zoom-in"
                    @doubleclick.prevent="setActiveLayer(element.id)"
                    @click.stop="zoomToLayer(element.id)"
                  >
                    {{ element.label }} - {{ element.id }}
                  </q-item-label>
                </div>
   
              </div>

              <div class="fit flex layer-tools">
                  <div>
                    <q-icon
                      v-if="element.visible==true" class="toc-layer-icon"
                      name="visibility" @click.stop.prevent="toggleVisibility(element, element.id)"
                    />
                    <q-icon v-else class="toc-layer-icon"
                      name="visibility_off" @click.stop.prevent="toggleVisibility(element, element.id)"
                    />
                  </div>
                  <div @click.stop>
                    <input
                      :id="'color-picker_' + element.id"
                      type="color"
                      value="element.color"
                      @input="changeColor($event, element.id)" hidden
                    />
                    <label :for="'color-picker_' + element.id">
                      <q-icon class="toc-layer-icon palette q-mr-sm" name="square"
                        :style="{color:element.color,background:element.color}" />
                    </label>
                  </div>

                  <div>
                    <q-icon
                      name="terrain" square color="brown"
                      size="2em" class="track-download"
                      @click="showTrackProfile(element.id)"
                    />
                  </div>
                  <div>
                      <q-icon
                        class="toc-layer-icon right"
                        name="settings"
                      />
                      <!-- <q-slider v-if="slider"
                        label
                        v-model="sliderValue" :min="0" :max="300"
                        @update:model-value="updateTolerance"
                        /> -->
                  </div>
                  <div>
                    <q-icon color="grey-14" name="file_download"
                      square size="2em" class="track-download"
                      @click.stop.prevent="downloadTrack(element.id)"
                    />
                  </div>
              </div>
            </div>
            <div class="cursor-drag flex items-center">
              <q-icon class="toc-layer-icon cursor-drag handle" name="more_vert"
                @mouseover="draggable=true" @mouseleave="draggable=false"
              />
            </div>
        </q-item>
        </div>
      </template>
    </draggable>
  </div>
</template>


<script>
import { computed, defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import draggable from "vuedraggable";

export default defineComponent({
  name: 'GpxList',
  components: { draggable },
  emits: [
    'zoomToLayer',
    'toggleLayer',
    'changeColor',
    'finishDrag',
    'download-track',
    'create-track',
    'overGraphic',
    'track-profile'
  ],

  setup(props, context){
    const draggable = ref(false)
    let startLoc = 0
    let dragging = false
    let over = {}
    let dragFrom = {}

    const $store = useStore()

    const data = computed({
      // getter
      get() {
        return $store.getters['main/TOCLayers']
      },
      // setter
      set(newValue) {
        $store.commit('main/newOrder', newValue)
        context.emit('finishDrag')
      }
    })

    const toggleVisibility = (layer, layerId) => {
      context.emit('toggleLayer', layerId)
    }

    const zoomToLayer = (layerId) => {
      context.emit('zoomToLayer', layerId)
    }

    const changeColor = (e, layerId) => {
      const newColor = e.target.value
      context.emit('changeColor', {
        color: newColor,
        layerId: layerId
      })
    }

    const setActiveLayer = (index) => {
      $store.commit('main/activeLayerId', index)
      $store.commit('main/setActiveLayer', index)
    }

    // DRAGGING
    const startDrag = (item, i, e) => {
      // e.dataTransfer.dropEffect = 'move'
      // e.dataTransfer.effectAllowed = 'move'
      startLoc = e.clientY;
      dragging = true;
      dragFrom = item;
    }

    const finishDrag = (item, pos) => {
      $store.commit('main/ReorderLayers', {
        pos,
        over: over.pos,
      })
      over = {}
      context.emit('finishDrag')
    }

    const onDragOver = (item, pos, e) => {
      const dir = (startLoc < e.clientY) ? 'down': 'up';
      setTimeout(() => {
        over = { item, pos, dir };
      }, 50)
    }

    const downloadTrack = function (layerId) {
      context.emit('download-track', layerId)
    }

    // const createTrack = (payload) => {
    //   context.emit('create-track', payload)
    // }

    const overGraphic = (data) => {
      context.emit('overGraphic', data)
    }

    const showTrackProfile = (layerId) => {
      context.emit('track-profile', layerId)
      zoomToLayer(layerId)
      setActiveLayer(layerId)
    }

    return {
      data,
      showTrackProfile,
      overGraphic,
      // createTrack,
      downloadTrack,
      draggable,
      over,
      startDrag,
      finishDrag,
      onDragOver,
      setActiveLayer,
      toggleVisibility,
      zoomToLayer,
      changeColor
    }
  }
})
</script>

<style lang="scss">
label.active{
  background: $active;
}

.toc-layer-icon.palette{
  border: 2px solid black;
  padding: 0;
  box-sizing: border-box;
}

.toc-layer-icon{
  cursor:pointer;
  font-size: 1.5em;
}

.cursor-drag{
  cursor: move;
}

.list > div {
    display: flex;
    flex-direction: column; 
}

.item {
  width: 200px;
  padding: 10px;
  margin: 10px auto 10px 10px;
  background: tomato;
  color: white;
  font-family: sans-serif;
  border-radius: 5px;
  display: inline-block;
/*   transition: opacity .3s ease-in-out; */
}

.flip-list-move {
  transition: transform .2s;
}


.over {
  opacity: .6;
}

.handle{
  font-size: 1.5em;
}
.drag-item{
  border: 1px solid grey;
  border-radius: 5px;
  padding: 3px 5px;
  margin: 4px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;  
}
.drag-item.active{
  background: $active;
}

.ghost {
   font-style: italic;
}

.zoom-in{
  cursor: zoom-in;
  font-weight:600;
  font-size: 1.1em;
  font-color: black;
}
.track-download{
  cursor: pointer;
}
.q-item__section--side {
  padding-right: 4px;
}
.q-item__section--main + .q-item__section--main {
  margin-left: 3px;
}
.no-events{
  pointer-events: none;
}
.layer-tools div{
  flex-grow: 1;
}
</style>
