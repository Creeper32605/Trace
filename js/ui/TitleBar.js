const Trace = require('../trace')

class TitleText extends Trace.Object {
  constructor () {
    super()

    this.visibility = new Trace.AnimatedNumber(1)
    this.text = ''

    this.width = 0
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    let opacity = this.opacity.getValue(currentTime, deltaTime)
    let visibility = this.visibility.getValue(currentTime, deltaTime)

    Trace.Utils.setTransformMatrix(ctx, transform)

    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'

    let skewX = -visibility / 2
    if (this.text) {
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '13px Avenir Next, Avenir, BlinkMacSystemFont, Helvetica, Roboto, Segoe UI, Arial, sans-serif'
      let textWidth = ctx.measureText(this.text).width
      let rectWidth = textWidth * visibility
      ctx.fillRect(-rectWidth / 2, -12, rectWidth, 24)

      ctx.globalCompositeOperation = 'source-in'
      ctx.globalAlpha = opacity

      ctx.fillText(this.text, 0, 0)

      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#000'
      ctx.transform(1, 0, skewX, 1, 0, 0)
      ctx.fillRect(-rectWidth, -12, rectWidth * 2, 24)
    } else {
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#000'
      ctx.transform(1, 0, skewX, 1, 0, 0)
    }

    ctx.fillRect(-this.width / 2 - 6, -12, 76 * visibility, 24)
  }
}

class TitleBar extends window.HTMLElement {
  constructor () {
    super()

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.appendChild(this.canvas)

    this.timeline = new Trace.Timeline(this.ctx)
    this.timeline.duration = 1

    this.titleText = new TitleText()
    this.titleText.visibility.addKey(0, 0)
    this.titleText.visibility.addKey(1, 1, Trace.Easing.easeOutExpo)

    this.timeline.addChild(this.titleText)

    this.timeline.on('end', () => {
      this.timeline.stop()
    })

    this.timeline.on('timeupdate', () => {
      this.ctx.resetTransform()
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    })

    this.addEventListener('mouseover', e => {
      this.timeline.run()
      this.timeline.play()
      this.timeline.playbackRate = 1
    })
    this.addEventListener('mouseleave', e => {
      this.timeline.run()
      this.timeline.play()
      this.timeline.playbackRate = -1
    })
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

    this.titleText.transform.translateX.defaultValue = rect.width / 2
    this.titleText.transform.translateY.defaultValue = rect.height / 2

    this.titleText.width = rect.width
  }

  connectedCallback () {
    this.update()
  }
}
window.customElements.define('trace-title-bar', TitleBar)
module.exports = TitleBar
