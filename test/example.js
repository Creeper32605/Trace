// this works because this is in the repo
const Trace = require('trace-api')

class Burst extends Trace.Object {
  constructor () {
    super()

    this.inner = new Trace.AnimatedNumber(0)
    this.outer = new Trace.AnimatedNumber(0)
    this.lines = new Trace.AnimatedNumber(5)
    this.angleOffset = new Trace.AnimatedNumber(0)
    this.fill = new Trace.AnimatedString('#fff')
    this.stroke = new Trace.AnimatedString('')
    this.lineWidth = new Trace.AnimatedNumber(2)
    this.lineCap = new Trace.AnimatedString('round')
    this.blur = new Trace.AnimatedNumber(0)
  }
  drawSelf (ctx, transform, currentTime, deltaTime) {
    Trace.Utils.resetCtx(ctx)
    Trace.Utils.setTransformMatrix(ctx, transform)

    ctx.globalAlpha = this.opacity.getValue(currentTime, deltaTime)

    let inner = this.inner.getValue(currentTime, deltaTime)
    let outer = this.outer.getValue(currentTime, deltaTime)
    let lines = this.lines.getValue(currentTime, deltaTime)
    let angleOffset = this.angleOffset.getValue(currentTime, deltaTime)
    let fill = this.fill.getValue(currentTime, deltaTime)
    let stroke = this.stroke.getValue(currentTime, deltaTime)
    let lineWidth = this.lineWidth.getValue(currentTime, deltaTime)
    let lineCap = this.lineCap.getValue(currentTime, deltaTime)
    let blur = this.blur.getValue(currentTime, deltaTime)

    let angle = (Math.PI * 2) / lines

    ctx.fillStyle = fill
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.lineCap = lineCap

    if (blur) {
      ctx.shadowBlur = blur
      ctx.shadowColor = stroke || fill
    }

    if (fill) {
      ctx.beginPath()
      ctx.arc(0, 0, outer, 0, Math.PI * 2)
      ctx.arc(0, 0, inner, 0, Math.PI * 2, true)
      ctx.fill()
    }
    if (stroke && outer - inner !== 0) {
      ctx.beginPath()
      for (let i = 0; i < lines; i++) {
        let cos = Math.cos(i * angle + angleOffset)
        let sin = Math.sin(i * angle + angleOffset)
        ctx.moveTo(cos * inner, sin * inner)
        ctx.lineTo(cos * outer, sin * outer)
      }
      ctx.stroke()
    }
  }
}

class SelectionBox extends Trace.Object {
  constructor () {
    super()

    this.width = new Trace.AnimatedNumber(0)
    this.height = new Trace.AnimatedNumber(0)
    this.offsetX = new Trace.AnimatedNumber(0)
    this.offsetY = new Trace.AnimatedNumber(0)
    this.color = new Trace.AnimatedColor('#2980da')
  }
  drawSelf (ctx, transform, currentTime, deltaTime) {
    Trace.Utils.setTransformMatrix(ctx, transform)

    const width = this.width.getValue(currentTime, deltaTime)
    const height = this.height.getValue(currentTime, deltaTime)
    const color = this.color.getValue(currentTime, deltaTime)
    const opacity = this.opacity.getValue(currentTime, deltaTime)
    const offsetX = this.offsetX.getValue(currentTime, deltaTime)
    const offsetY = this.offsetY.getValue(currentTime, deltaTime)

    ctx.globalAlpha = opacity
    ctx.translate(offsetX, offsetY)

    // draw box
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.rect(0, 0, width, height)
    ctx.stroke()

    // draw boxes
    let positions = [
      [0, 0], [width, 0], [width, height], [0, height],
      [width / 2, 0], [width, height / 2], [width / 2, height], [0, height / 2]
    ]
    for (let pos of positions) {
      ctx.fillStyle = color
      ctx.fillRect(pos[0] - 10, pos[1] - 10, 20, 20)
    }
  }
}

class Main extends Trace.Timeline {
  constructor (canvas) {
    super()

    this.ctx = canvas.ctx
    let viewport = new Trace.Viewport()
    this.addChild(viewport)
    viewport.width = 1920
    viewport.height = 1080
    viewport.backgroundColor = '#000'

    let resize = () => {
      viewport.canvasWidth = canvas.width
      viewport.canvasHeight = canvas.height
      viewport.canvasScale = canvas.scale
    }
    resize()
    canvas.on('resize', resize)

    this.duration = 7
    this.run()
    this.play()

    // add elements
    {
      let burst = new Burst()
      viewport.addChild(burst)
      burst.addKeys({
        inner: {
          0.1: 0,
          1: [700, Trace.Easing.easeOutExpo],
          5: [1400, Trace.Easing.step],
          6: [0, Trace.Easing.easeInExpo]
        },
        outer: {
          0: 50,
          0.8: [700, Trace.Easing.easeOutExpo],
          5: [1400, Trace.Easing.step],
          5.2: Trace.AnimatedValue.PREV_KEY,
          6: [100, Trace.Easing.easeInExpo]
        },
        transform: {
          translateX: 960,
          translateY: 540
        },
        fill: {
          2: '#fff',
          3: ['', Trace.Easing.step]
        },
        stroke: {
          2: '',
          3: ['#fff', Trace.Easing.step]
        },
        lines: 10,
        lineWidth: 10,
        enabled: {
          0: true,
          1: false,
          5: true,
          6: false
        }
      })
      let text = new Trace.ClippedText()
      viewport.addChild(text)
      text.addKeys({
        text: 'Hello world!',
        color: 'white',
        family: 'Lato, Helvetica Neue, Helvetica, Roboto, Arial, sans-serif',
        weight: 700,
        size: 160,
        transform: {
          translateX: 960,
          translateY: 540,
          scaleX: { 0: 0.5, 1: [1, Trace.Easing.easeOutExpo] },
          scaleY: { 0: 0.5, 1: [1, Trace.Easing.easeOutExpo] }
        },
        opacity: { 0: 0, 1: 1 },
        clip: {
          0: -1,
          1: [0, Trace.Easing.easeOutExpo],
          5: Trace.AnimatedValue.PREV_KEY,
          6: [1, Trace.Easing.easeInExpo]
        },
        skew: Math.PI / 6,
        compensation: 1,
        zIndex: 1
      })
      let selection = new SelectionBox()
      viewport.addChild(selection)
      selection.addKeys({
        transform: {
          translateX: 960,
          translateY: 540
        },
        offsetX: -500,
        offsetY: -150,
        width: 1000,
        height: 300,
        opacity: { 1: 0, 1.5: 1, 4.5: 1, 5: 0 }
      })

      let transformKeys = {
        transform: {
          translateX: {
            1: 960,
            2: [1060, Trace.Easing.easeInOutCubic],
            4.1: [960, Trace.Easing.step]
          },
          translateY: {
            1: 540
          },
          skewX: {
            2: 0,
            2.5: [Math.PI / 3, Trace.Easing.easeInOutCubic],
            4.1: [0, Trace.Easing.step]
          },
          skewY: {
            3: 0,
            3.5: [-Math.PI / 3, Trace.Easing.easeInOutCuic],
            4.1: [0, Trace.Easing.step]
          }
        },
        opacity: {
          4: 1,
          4.1: 0,
          4.5: 1
        }
      }
      text.addKeys(transformKeys)
      selection.addKeys(transformKeys)

      let reverse = new Trace.ClippedText()
      viewport.addChild(reverse)
      reverse.addKeys({
        text: '.playbackRate = -1',
        color: 'white',
        family: 'Inconsolata, Menlo, Monaco, Consolas, Lucida Console, monospace',
        size: 60,
        transform: {
          translateX: 960,
          translateY: 540
        },
        clip: {
          6: -1,
          7: [0, Trace.Easing.easeOutExpo]
        },
        compensation: 1
      })

      let playbackRate = new Trace.ClippedText()
      playbackRate.addKeys({
        text: '.playbackRate = 1',
        color: 'red',
        family: 'Inconsolata, Menlo, Monaco, Consolas, Lucida Console, monospace',
        size: 60,
        transform: {
          translateX: 960,
          translateY: 740
        },
        clip: {
          0: 0,
          1: [1, Trace.Easing.easeInExpo]
        },
        compensation: 1,
        zIndex: 2
      })

      let didAddRate = false
      this.on('timeupdate', () => {
        if (this.currentTime >= 6.9) {
          this.playbackRate = -1
          if (!didAddRate) {
            viewport.addChild(playbackRate)
            didAddRate = true
          }
        }
        if (this.currentTime <= 0) this.playbackRate = 1
      })
    }
  }
}

module.exports = {
  title: 'Example',
  Main: Main,
  timeline: true
}
