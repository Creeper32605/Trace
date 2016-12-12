const Trace = require('../trace')

class ToggleButton extends Trace.Object {
  constructor () {
    super()

    this.state = new Trace.AnimatedNumber(0)
    this.state.interpolatorSettings.spring = [100, 20]
    this.state.interpolatorSettings.springPosition = 0
    this.state.interpolatorSettings.springVelocity = 0
    this.state.interpolator = Trace.AnimatedNumber.springInterpolator

    this.width = 32
    this.height = 32
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    let state = this.state.getValue(currentTime, deltaTime)

    Trace.Utils.setTransformMatrix(ctx, transform)

    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    let stateOne = Trace.Easing.easeOutExpo(Math.max(0, 1.5 * state - 0.5))
    ctx.globalAlpha = stateOne
    ctx.translate(16, 16)
    ctx.scale(stateOne, stateOne)

    this.stateOne(ctx)

    let stateZero = Trace.Easing.easeOutExpo(Math.max(0, -1.5 * state + 1))
    ctx.globalAlpha = stateZero
    Trace.Utils.setTransformMatrix(ctx, transform)
    ctx.translate(16, 16)
    ctx.scale(stateZero, stateZero)

    this.stateZero(ctx)
  }
  stateZero () {}
  stateOne () {}
}

class PlayPause extends ToggleButton {
  stateZero (ctx) {
    ctx.beginPath()
    ctx.moveTo(-6, -8)
    ctx.lineTo(-6, 8)
    ctx.moveTo(6, -8)
    ctx.lineTo(6, 8)
    ctx.stroke()
  }
  stateOne (ctx) {
    ctx.beginPath()
    ctx.moveTo(-7, -8)
    ctx.lineTo(7, 0)
    ctx.lineTo(-7, 8)
    ctx.closePath()
    ctx.stroke()
  }

  click (timeline) {
    if (timeline.paused) timeline.play()
    else timeline.pause()
  }
}
class RunStop extends ToggleButton {
  stateZero (ctx) {
    ctx.beginPath()
    ctx.moveTo(-7, -7)
    ctx.lineTo(-7, 7)
    ctx.lineTo(7, 7)
    ctx.lineTo(7, -7)
    ctx.closePath()
    ctx.stroke()
  }
  stateOne (ctx) {
    ctx.beginPath()
    ctx.moveTo(-8, 7)
    ctx.lineTo(0, -8)
    ctx.lineTo(8, 7)
    ctx.closePath()
    ctx.stroke()
  }

  click (timeline) {
    if (timeline.running) timeline.stop()
    else timeline.run()
  }
}
class ToggleMenu extends ToggleButton {
  stateZero (ctx) {
    ctx.beginPath()
    ctx.arc(-6, 0, 1.5, 0, 2 * Math.PI)
    ctx.arc(0, 0, 1.5, 0, 2 * Math.PI)
    ctx.arc(6, 0, 1.5, 0, 2 * Math.PI)
    ctx.fill()
  }
  stateOne (ctx) {
    ctx.beginPath()
    ctx.moveTo(-6, -3)
    ctx.lineTo(0, 4)
    ctx.lineTo(6, -3)
    ctx.stroke()
  }

  click (timeline) {
    this.state.defaultValue = +!this.state.defaultValue
  }
}

class SeekBar extends Trace.Object {
  constructor () {
    super()

    this.currentTime = new Trace.AnimatedNumber(0)
    this.currentTime.interpolatorSettings.spring = [7000, 400]
    this.currentTime.interpolatorSettings.springPosition = 0
    this.currentTime.interpolatorSettings.springVelocity = 0
    this.currentTime.interpolator = Trace.AnimatedNumber.springInterpolator

    this.duration = new Trace.AnimatedNumber(1)
    this.duration.interpolatorSettings.spring = [7000, 400]
    this.duration.interpolatorSettings.springPosition = 1
    this.duration.interpolatorSettings.springVelocity = 0
    this.duration.interpolator = Trace.AnimatedNumber.springInterpolator

    this.width = 0
    this.height = 32

    this.mouseDown = false
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    Trace.Utils.setTransformMatrix(ctx, transform)
    let time = this.currentTime.getValue(currentTime, deltaTime)
    let duration = this.duration.getValue(currentTime, deltaTime)

    ctx.globalAlpha = 0.5
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(1, 16)
    ctx.lineTo(this.width - 1, 16)
    ctx.stroke()

    if (duration > 0) {
      ctx.globalAlpha = 1
      let cpos = this.width * (time / duration)
      ctx.clearRect(cpos - 2, 0, 4, 32)
      ctx.beginPath()
      ctx.moveTo(cpos, 10)
      ctx.lineTo(cpos, 22)
      ctx.stroke()
    }
  }

  mousedown (timeline, x, y) {
    let duration = this.duration.getValue(0, 0)
    timeline.currentTime = x / this.width * duration
    this.mouseDown = true
  }
  mousemove (timeline, x, y) {
    if (!this.mouseDown) return
    let duration = this.duration.getValue(0, 0)
    timeline.currentTime = x / this.width * duration
    if (timeline.currentTime < 0) timeline.currentTime = 0
    if (timeline.currentTime > duration) timeline.currentTime = duration
  }
  mouseup (timeline, x, y) {
    if (!this.mouseDown) return
    let duration = this.duration.getValue(0, 0)
    timeline.currentTime = x / this.width * duration
    if (timeline.currentTime < 0) timeline.currentTime = 0
    if (timeline.currentTime > duration) timeline.currentTime = duration
    this.mouseDown = false
  }
}

class TimelineControls extends window.HTMLElement {
  constructor () {
    super()

    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.appendChild(this.canvas)

    this.timeline = new Trace.Timeline()
    this.timeline.paused = true
    this.timeline.currentTime = 0
    this.timeline.duration = 10
    this.timeline.loop = true

    this.playPause = new PlayPause()
    this.runStop = new RunStop()
    this.toggleMenu = new ToggleMenu()
    this.seekBar = new SeekBar()

    this.drawTimeline = new Trace.Timeline(this.ctx)
    this.drawTimeline.addChild(this.playPause)
    this.drawTimeline.addChild(this.runStop)
    this.drawTimeline.addChild(this.toggleMenu)
    this.drawTimeline.addChild(this.seekBar)

    this.drawTimeline.on('timeupdate', () => {
      this.ctx.resetTransform()
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

      this.playPause.state.defaultValue = +this.timeline.paused
      this.runStop.state.defaultValue = +!this.timeline.running
      this.seekBar.currentTime.defaultValue = this.timeline.currentTime
      this.seekBar.duration.defaultValue = this.timeline.duration
    })

    let getNodesFromPoint = function (x, y, dontActuallyCheck) {
      let nodes = []
      for (let node of this.drawTimeline.children.values()) {
        let translateX = node.transform.translateX.getValue(this.drawTimeline.currentTime, 0)
        let translateY = node.transform.translateY.getValue(this.drawTimeline.currentTime, 0)
        if ((translateX <= x && x < translateX + node.width &&
          translateY <= y && y < translateY + node.height) || dontActuallyCheck) {
          let offsetX = x - translateX
          let offsetY = y - translateY
          nodes.push([node, offsetX, offsetY])
        }
      }
      return nodes
    }.bind(this)

    this.addEventListener('click', e => {
      let rect = this.getBoundingClientRect()
      let offsetX = e.pageX - rect.left
      let offsetY = e.pageY - rect.top

      for (let node of getNodesFromPoint(offsetX, offsetY)) {
        if (node[0].click) node[0].click(this.timeline, node[1], node[2])
      }
    })
    let mouseDown = false
    this.addEventListener('mousedown', e => {
      let rect = this.getBoundingClientRect()
      let offsetX = e.pageX - rect.left
      let offsetY = e.pageY - rect.top
      for (let node of getNodesFromPoint(offsetX, offsetY)) {
        if (node[0].mousedown) node[0].mousedown(this.timeline, node[1], node[2])
      }
      mouseDown = true
    })
    window.addEventListener('mousemove', e => {
      if (!mouseDown) return
      let rect = this.getBoundingClientRect()
      let offsetX = e.pageX - rect.left
      let offsetY = e.pageY - rect.top
      for (let node of getNodesFromPoint(offsetX, offsetY, true)) {
        if (node[0].mousemove) node[0].mousemove(this.timeline, node[1], node[2])
      }
    })
    window.addEventListener('mouseup', e => {
      if (!mouseDown) return
      let rect = this.getBoundingClientRect()
      let offsetX = e.pageX - rect.left
      let offsetY = e.pageY - rect.top
      for (let node of getNodesFromPoint(offsetX, offsetY, true)) {
        if (node[0].mouseup) node[0].mouseup(this.timeline, node[1], node[2])
      }
      mouseDown = false
    })
  }
  get hidden () {
    return this.classList.contains('hidden')
  }
  set hidden (v) {
    if (v) this.classList.add('hidden')
    else this.classList.remove('hidden')
  }
  get disabled () {
    return this.classList.contains('disabled')
  }
  set disabled (v) {
    if (v) this.classList.add('disabled')
    else this.classList.remove('disabled')
  }

  update () {
    if (!this.isConnected) return
    let rect = this.getBoundingClientRect()
    let dp = window.devicePixelRatio
    this.canvas.width = rect.width * dp
    this.canvas.height = rect.height * dp
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'

    this.drawTimeline.transform.scaleX.defaultValue = dp
    this.drawTimeline.transform.scaleY.defaultValue = dp

    this.runStop.transform.translateX.defaultValue = rect.width - 64
    this.toggleMenu.transform.translateX.defaultValue = rect.width - 32
    this.seekBar.width = rect.width - 96
    this.seekBar.transform.translateX.defaultValue = 32
  }

  connectedCallback () {
    this.update()

    this.drawTimeline.run()
    this.drawTimeline.play()
  }
}
window.customElements.define('trace-timeline', TimelineControls)
module.exports = TimelineControls
