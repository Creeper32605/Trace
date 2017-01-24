const Trace = require('../../trace-api')

class UIComponent extends window.HTMLElement {
  constructor () {
    super()

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')

    this.width = 0
    this.height = 0
    this.__didAppend = false

    this.timeline = new Trace.Timeline(this.ctx)
    this.timeline.duration = 1

    this.timeline.on('timeupdate', () => {
      this.ctx.resetTransform()
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    })
  }

  connectedCallback () {
    if (!this.__didAppend) {
      this.appendChild(this.canvas)
      this.__didAppend = true
      this.dispatchEvent(new window.Event('append'))
    }
    this.update()
  }

  update () {
    if (!this.isConnected) return
    let rect = this.getBoundingClientRect()
    let dp = window.devicePixelRatio
    this.canvas.width = rect.width * dp
    this.canvas.height = rect.height * dp
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'

    this.timeline.transform.scaleX.defaultValue = dp
    this.timeline.transform.scaleY.defaultValue = dp

    this.width = rect.width
    this.height = rect.height

    this.dispatchEvent(new window.Event('update'))
  }
}
window.customElements.define('trace-ui-component', UIComponent)
module.exports = UIComponent
