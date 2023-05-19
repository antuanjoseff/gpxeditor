import {unByKey} from 'ol/Observable'
import { Style, Stroke } from 'ol/style';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import Feature from 'ol/Feature.js';
import LineString from 'ol/geom/LineString.js';
import {selectStyle} from './utils.js';

export class TrackInvers {
  /**
   * @param {Object} [map, opt_options] Control options.
   */
  constructor(map, options) {
    this.map = map
    this.options = options || {}
    this.active = false
    this.layerToReverse = undefined
    this.callback = this.options.callback
    this.throttleTime = 50
    this.throttleTimer = undefined
    this.originalLayer = undefined
    this.modifiedLayer = undefined
    this.color = undefined
    this.width = undefined
  }

  isActive() {
    return this.active
  }

  activate() {
    this.active = true
    this.pointermoveBinder = this.map.on('pointermove', this.hover.bind(this))
    this.clickBinder = this.map.on('singleclick', this.singleClick.bind(this))

    this.modifiedLayer = new VectorLayer({
      visible: false,
      source: new VectorSource({
        features: [
          new Feature({
            geometry: new LineString([[]])
          })  
        ]
      })
    })
    this.map.addLayer(this.modifiedLayer)
  }

  deactivate() {
    unByKey(this.pointermoveBinder)
    unByKey(this.clickBinder)
    this.layerToReverse = undefined
    this.throttleTimer = undefined
    this.originalLayer = undefined
    this.modifiedLayer = undefined
    this.color = undefined
    this.width = undefined
    this.pointermoveBinde = undefined
    this.clickBinder = undefined
  }


  _modifiedLayerIsEmpty() {
    return (this.modifiedLayer.getSource().getFeatures()[0].getGeometry().getCoordinates().length === 0)
  }

  singleClick(e) {
    if (!this._modifiedLayerIsEmpty()) {
      this.pause = true
      this.reverse()
    }
  }

  hover(e) {
    var _this = this
    if (this.throttleTimer) return
    this.throttleTimer = true
    setTimeout(async () => {
      var _this = this
      if (_this.pause) return

      const hit = this.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        // SELECT ONLY ONE LAYER
        if (_this._modifiedLayerIsEmpty()) {
          _this.color = layer.getStyle().getStroke().getColor()
          _this.width = layer.getStyle().getStroke().getWidth()
          _this.originalLayer = layer
          _this.modifiedLayer.getSource().getFeatures()[0].getGeometry().setCoordinates(
            layer.getSource().getFeatures()[0].getGeometry().getCoordinates()
          )
        }
        return true
      }, { hitTolerance: 10 })

      if (hit) {
        this.map.getTargetElement().style.cursor = 'pointer'
        this.originalLayer.setStyle(selectStyle)
      } else {
        this.modifiedLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([])
        this.map.getTargetElement().style.cursor = ''
        if (this.originalLayer) {
          this.originalLayer.setStyle(
            new Style({
              stroke: new Stroke({
                color: this.color,
                width: this.width
              })
            })
          )
        }
      }
      _this.throttleTimer = false
    }, this.throttleTime)
  }

  reverse() {
    var _this = this
    let index = 0
    let animation
    const coords = this.originalLayer.getSource().getFeatures()[0].getGeometry().getCoordinates()
    coords.reverse()
    const n = coords.length
    // DO ANIMATIONS
    const duration = 1000
    let nLoops = duration / 50 // 50ms between
    let increment = n /nLoops

    function addCoord() {
      index += increment
      _this.originalLayer.getSource().getFeatures()[0].getGeometry().setCoordinates(coords.slice(0,index))
      if (index >= n) {
        clearInterval(animation)
        _this.originalLayer.setStyle(
          new Style({
            stroke: new Stroke({
              color: _this.color,
              width: _this.width
            })
          })
        )
        _this.pause = false
        _this.throttleTimer = false
      }
    }

    this.modifiedLayer.getSource().getFeatures()[0].getGeometry().setCoordinates([])
    animation = setInterval(addCoord, 50)
  }

  done() {
    this.callback(this.coords, this.activeLayer)
    this.map.dispatchEvent({
      type: 'toolFinished',
      toolname: 'invers'
    })
    this.deactivate()
  }

  // TODO
  reset() {
  }

}
