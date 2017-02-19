const EventEmitter = require('events')

class MainCanvas extends window.HTMLElement {
  constructor () {
    super()

    this.canvas = document.createElement('canvas')
    this.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    this.proxy = new EventEmitter()
    this.proxy.ctx = this.ctx
    this.proxy.width = 0
    this.proxy.height = 0
    this.proxy.scale = 1

    this.updateSize = function () {
      let rect = this.getBoundingClientRect()
      let dp = window.devicePixelRatio
      this.canvas.width = rect.width * dp
      this.canvas.height = rect.height * dp
      this.canvas.style.width = rect.width + 'px'
      this.canvas.style.height = rect.height + 'px'

      this.proxy.width = rect.width
      this.proxy.height = rect.height
      this.proxy.scale = dp

      this.proxy.emit('resize')
    }.bind(this)

    window.addEventListener('resize', () => {
      this.updateSize()
    })
  }

  connectedCallback () {
    this.updateSize()
  }

  get disabled () {
    return this.classList.contains('disabled')
  }
  set disabled (v) {
    if (v) this.classList.add('disabled')
    else this.classList.remove('disabled')
  }
}
window.customElements.define('trace-main-canvas', MainCanvas)
module.exports = MainCanvas
