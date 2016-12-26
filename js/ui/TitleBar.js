const {ipcRenderer} = require('electron')
const Trace = require('../trace')
const UIComponent = require('./Component')

class TitleObject extends Trace.Object {
  constructor () {
    super()

    this.clip = new Trace.AnimatedNumber(1)
    this.clip.addKey(0, 0)
    this.clip.addKey(1, 1, Trace.Easing.easeOutExpo)
  }

  drawRectangle (ctx, x, y, width, height, skew) {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + width + skew, y)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x - skew, y + height)
    ctx.closePath()
  }
}

class TitleText extends TitleObject {
  constructor (text = '') {
    super()

    this.text = text
    this.weight = 400
    this.size = 13
    this.font = 'Avenir Next, Avenir, BlinkMacSystemFont, Helvetica, Roboto, ' +
      'Segoe UI, Arial, sans-serif'
    this.height = 24
    this.skew = 10
    this.background = '#000'
    this.color = '#fff'
    this.align = 'center'
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    Trace.Utils.resetCtx(ctx)
    Trace.Utils.setTransformMatrix(ctx, transform)

    let opacity = this.opacity.getValue(currentTime, deltaTime)
    let clip = this.clip.getValue(currentTime, deltaTime)

    if (!this.text || !opacity || !clip) return

    ctx.globalAlpha = opacity
    ctx.font = `${this.weight} normal ${this.size}px ${this.font}`

    let width = ctx.measureText(this.text).width
    let backgroundWidth = (width + 40) * clip
    let rectLeft = this.align === 'center' ? -backgroundWidth / 2 : 0
    this.drawRectangle(ctx, rectLeft, 0, backgroundWidth, this.height,
      this.skew * clip)
    ctx.fillStyle = this.background
    ctx.fill()

    ctx.save()
    let clipWidth = Math.max(0, backgroundWidth - 20)
    this.drawRectangle(ctx, rectLeft + 10, 0, clipWidth, this.height,
      this.skew * clip)
    ctx.clip()
    ctx.fillStyle = this.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let textLeft = this.align === 'center' ? 0 : backgroundWidth / 2
    ctx.fillText(this.text, textLeft, this.height / 2)
    ctx.restore()
  }
}

class WindowControls extends TitleObject {
  constructor () {
    super()

    this.height = 24
    this.skew = 10
    this.background = '#000'
    this.color = '#fff'
    this.lineWidth = 1
    this.lineCap = 'butt'
    this.align = 'right'
    this.zoom = false

    this.sizes = []
    this.hover = []
    for (let i = 0; i < 3; i++) {
      let a = new Trace.AnimatedNumber(0)
      this.hover.push(a)
      a.interpolator = Trace.AnimatedNumber.springInterpolator
      a.interpolatorSettings.spring = [200, 30]
      this.sizes.push(new Trace.AnimatedNumber(5))
    }
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    Trace.Utils.resetCtx(ctx)
    Trace.Utils.setTransformMatrix(ctx, transform)

    let opacity = this.opacity.getValue(currentTime, deltaTime)
    let clip = this.clip.getValue(currentTime, deltaTime)

    if (!opacity || !clip) return

    ctx.globalAlpha = opacity

    let width = (42 * 3) * clip
    let left = this.align === 'left' ? 0 : -width
    this.drawRectangle(ctx, left, 0, width, this.height, this.skew * clip)
    ctx.fillStyle = this.background
    ctx.fill()

    ctx.save()
    this.drawRectangle(ctx, left, 0, width, this.height, this.skew * clip)
    ctx.clip()
    ctx.fillStyle = this.color

    for (let i = 0; i < 3; i++) {
      let cx = (this.align === 'left' ? 42 * 3 : 0) - i * 42 - 42 / 2
      let hover = this.hover[i].getValue(currentTime, deltaTime)
      let size = this.sizes[i].getValue(currentTime, deltaTime)
      this.drawControl(ctx, i, cx, this.height / 2, clip, opacity, hover, size)
    }
    ctx.restore()
  }

  drawControl (ctx, type, x, y, clip, opacity, hover, size) {
    ctx.globalAlpha = Math.min(1, opacity * (hover / 2 + 0.5))
    ctx.beginPath()

    if (type === 0) {
      ctx.moveTo(x - size, y - size)
      ctx.lineTo(x + size, y + size)
      ctx.moveTo(x - size, y + size)
      ctx.lineTo(x + size, y - size)
    } else if (type === 1 && !this.zoom) {
      ctx.moveTo(x - size, y + size / 8)
      ctx.lineTo(x - size, y - size)
      ctx.lineTo(x + size / 8, y - size)
      ctx.moveTo(x + size, y - size / 8)
      ctx.lineTo(x + size, y + size)
      ctx.lineTo(x - size / 8, y + size)
    } else if (type === 1) {
      ctx.moveTo(x - size, y - size)
      ctx.lineTo(x + size, y - size)
      ctx.lineTo(x + size, y + size)
      ctx.lineTo(x - size, y + size)
      ctx.closePath()
    } else if (type === 2) {
      ctx.moveTo(x - size, y)
      ctx.lineTo(x + size, y)
    }
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.lineWidth
    ctx.lineCap = this.lineCap
    ctx.stroke()
  }
}

class TitleBar extends UIComponent {
  constructor () {
    super()

    this.titleText = new TitleText('Hello World')
    this.titleText.transform.translateX.defaultValue = 400
    this.titleText.transform.translateY.defaultValue = 0
    this.timeline.addChild(this.titleText)

    this.windowControls = new WindowControls()
    this.windowControls.transform.translateX.defaultValue = 800
    this.windowControls.sizes[0].addKey(0.0, 0)
    this.windowControls.sizes[1].addKey(0.1, 0)
    this.windowControls.sizes[2].addKey(0.2, 0)
    this.windowControls.sizes[0].addKey(0.8, 5, Trace.Easing.easeOutExpo)
    this.windowControls.sizes[1].addKey(0.9, 5, Trace.Easing.easeOutExpo)
    this.windowControls.sizes[2].addKey(1.0, 5, Trace.Easing.easeOutExpo)
    this.timeline.addChild(this.windowControls)

    this.addEventListener('update', () => {
      this.titleText.transform.translateX.defaultValue = this.width / 2
      this.windowControls.transform.translateX.defaultValue = this.width
    })

    let stopTimeout
    let animating = false
    let stopTimeline = function () {
      animating = false
      if (this.timeline.currentTime % 1 === 0) this.timeline.stop()
    }.bind(this)
    this.addEventListener('append', () => {
      if (process.platform !== 'darwin') this.classList.add('controls-enabled')
      let controls = document.createElement('div')
      controls.classList.add('window-controls')
      for (let i = 0; i < 3; i++) {
        let control = document.createElement('div')
        control.classList.add('window-control')
        control.addEventListener('mouseover', () => {
          this.windowControls.hover[i].defaultValue = 1
          this.timeline.run()
          animating = true
          clearTimeout(stopTimeout)
          stopTimeout = setTimeout(stopTimeline, 1500)
        })
        control.addEventListener('mouseout', () => {
          this.windowControls.hover[i].defaultValue = 0
          this.timeline.run()
          animating = true
          clearTimeout(stopTimeout)
          stopTimeout = setTimeout(stopTimeline, 1500)
        })
        control.addEventListener('click', () => {
          this.controlClicked(i)
        })
        controls.appendChild(control)
      }
      this.appendChild(controls)
    })

    this.timeline.on('end', () => {
      if (animating) return
      this.timeline.stop()
    })

    this.addEventListener('mouseover', () => {
      this.timeline.playbackRate = 1
      this.timeline.run()
      this.timeline.play()
    })
    this.addEventListener('mouseleave', () => {
      this.timeline.playbackRate = -1
      this.timeline.run()
      this.timeline.play()
    })
  }

  controlClicked (type) {
    if (type === 0) {
      ipcRenderer.send('window-close')
    } else if (type === 1 && this.windowControls.zoom) {
      ipcRenderer.send('window-zoom')
    } else if (type === 1) {
      ipcRenderer.send('window-fullscreen')
    } else if (type === 2) {
      ipcRenderer.send('window-minimize')
    }
  }

  get title () {
    return this.titleText.text
  }
  set title (v) {
    this.titleText.text = v
  }
}
window.customElements.define('trace-title-bar', TitleBar)
module.exports = TitleBar
