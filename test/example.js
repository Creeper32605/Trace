const Trace = require('trace')

// this is an example for bad style, too

class Text extends Trace.Object {
  constructor (content) {
    super()
    this.content = new Trace.AnimatedString(content)
    this.clip = new Trace.AnimatedNumber(0)
    this.color = '#fff'
    this.fontFamily = 'Avenir Next, Avenir, BlinkMacSystemFont, Helvetica, Roboto, Segoe UI, Arial, sans-serif'
    this.fontSize = new Trace.AnimatedNumber(12)
    this.fontWeight = new Trace.AnimatedNumber(400)
    this.fontStyle = 'normal'
    this.align = 'left'
    this.baseline = 'alphabetic'
    this.blur = new Trace.AnimatedNumber(0)
  }
  drawSelf (ctx, transform, currentTime, deltaTime) {
    Trace.Utils.resetCtx(ctx)
    Trace.Utils.setTransformMatrix(ctx, transform)

    ctx.globalAlpha = this.opacity.getValue(currentTime, deltaTime)
    ctx.fillStyle = this.color
    let size = this.fontSize.getValue(currentTime, deltaTime)
    let weight = Math.round(this.fontWeight.getValue(currentTime, deltaTime) / 100) * 100
    ctx.font = `${this.fontStyle} ${weight} ${size}px ${this.fontFamily}`
    ctx.textAlign = this.align
    ctx.textBaseline = this.baseline
    let content = this.content.getValue(currentTime, deltaTime)
    let clip = this.clip.getValue(currentTime, deltaTime)
    let blur = this.blur.getValue(currentTime, deltaTime)

    if (blur) ctx.filter = `blur(${blur}px)`

    let skew = size / 2
    let width = ctx.measureText(content).width + 2 * skew
    let leftIndent = Math.max(0, clip) * width
    let rightIndent = Math.min(0, clip) * width
    ctx.beginPath()
    ctx.moveTo(-width / 2 + skew + leftIndent, -size)
    ctx.lineTo(width / 2 + skew + rightIndent, -size)
    ctx.lineTo(width / 2 - skew + rightIndent, size)
    ctx.lineTo(-width / 2 - skew + leftIndent, size)
    ctx.save()
    ctx.clip()

    ctx.fillText(content, 0, 0)
    ctx.restore()
  }
}

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
    let lines = Math.floor(this.lines.getValue(currentTime, deltaTime))
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

class SceneBackground extends Trace.Object {
  constructor () {
    super()

    this.state = new Trace.AnimatedNumber(1)
    this.zIndex.defaultValue = -2
  }
  drawSelf (ctx, transform, currentTime, deltaTime) {
    Trace.Utils.resetCtx(ctx)
    Trace.Utils.setTransformMatrix(ctx, transform)
    let state = this.state.getValue(currentTime, deltaTime)

    ctx.globalAlpha = this.opacity.getValue(currentTime, deltaTime) * state
    {
      let gradient = ctx.createLinearGradient(0, 0, 0, 1080)
      gradient.addColorStop(0, '#78D4FE')
      gradient.addColorStop(1, '#2D81FE')
      ctx.fillStyle = gradient
    }
    ctx.fillRect(0, 0, 1920, 1080)

    ctx.translate(-63, 93 + 120 * (1 - state))
    ctx.fillStyle = '#3C8568'
    ctx.fill(new Trace.Path2D(`M38.3,442.8c15.7-101.1,153-519.4,300.9-319c109.6,148.4,120.5,348.9,142.7,525.1
    c11.2,88.7,24.6,177.7,52.1,263.1c36.3,112.5,121.3,119.2,227.9,123c84.1,3,180.4,2.8,242.8-63c67.9-71.6,93.5-185.6,127.4-275.4
    c39.1-103.8,78.3-207.7,117.4-311.5c37-98.3,65.4-209.5,119.7-299.9c37.9-63.1,134.6-123.5,197.7-54.7
    c25.2,27.5,33.7,65.7,45.6,99.8c16.2,46.7,45.7,85.9,67.9,129.7c43.1,85.1,61.7,180.2,104.9,265.8c46,91,102.6,176.1,151.9,265.3
    c27.2,49.1,129.5,199.3,44,233.3c-101.7,40.5-224.6,47.7-332.8,54.2c-390.1,23.4-785,11.3-1175.7,11.3c-91.6,0-183.4,1.9-275-2.3
    c-72-3.3-186.4,4.8-193.5-90.7c-7-94.1-3.6-190.1-3.7-284.4c0-89-3.6-182.4,35.4-265.4L38.3,442.8z`))

    Trace.Utils.setTransformMatrix(ctx, transform)
    ctx.translate(-57, 282 + 200 * (1 - state))
    ctx.fillStyle = '#60CF91'
    ctx.fill(new Trace.Path2D(`M35.9,422.7c89.3-3.3,159.2-70.9,207.9-139.6C294,212.4,338.5,94.8,428,65.3
    C590.6,11.7,678.9,279,754.4,370.4c49.3,59.7,124.2,104.3,204,100.6c84.4-3.9,131.2-175.1,158.4-239.4
    c29.9-70.6,49.6-187.8,127.1-223.4c90.3-41.5,172.6,86.2,216.9,145.9c34.5,46.4,100.7,172.2,170.2,119.8
    c40.3-30.4,76.1-68.6,113.3-102.6c32.3-29.5,77.5-93.5,128.2-74.7c89.5,33.2,133.3,127.3,135.2,215.4c2.5,114.7,5,229.5,7.5,344.2
    c1.5,70.1,28.5,196.1-51,234.9c-38.9,19-87,19.6-129.1,24.8c-63.3,7.8-126.7,15.5-190.1,22.9c-226.4,26.5-453.5,49.2-681.5,57.8
    c-262.7,9.9-527,0.8-786.5-43.5C52.4,931.7,12,863.9,3,742.7C-1.6,680-0.9,617,4.9,554.4C8.9,512.2,7.2,457.1,35.9,422.7z`))

    Trace.Utils.setTransformMatrix(ctx, transform)
    ctx.translate(-28, 713 + 367 * (1 - state))
    ctx.fillStyle = '#FEDE76'
    ctx.fill(new Trace.Path2D(`M0,49.7c65.5-40.5,171.4-25.4,245-28c102.1-3.7,204.2-7.2,306.4-10.4c194.9-6,390-10.4,585-11.2
    c194.9-0.8,389.9,2,584.7,10.5c46.4,2,92.8,4.3,139.1,7c27.8,1.6,55.6,3.3,83.4,5.2c42.7,2.9,27.8,19.1,28.3,56.2
    c1.5,99.5,6.1,198.9,13.8,298.1c-200.5,9.4-401,18.8-601.5,28.2c-207.9,9.7-417.1,27.4-625.2,13.3
    c-201.4-13.7-398.9-28.2-600.4-5.5c-39,4.4-81.4,16.7-120.5,15.9c-38.9-0.8-24.2-83.2-24.6-107.9c-0.7-51.8-1.5-103.6-2.2-155.4
    C10.9,136.5,23.5,70.3,0,49.7z`))
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
    viewport.canvasWidth = canvas.width
    viewport.canvasHeight = canvas.height
    viewport.canvasScale = canvas.scale
    canvas.on('resize', () => {
      viewport.canvasWidth = canvas.width
      viewport.canvasHeight = canvas.height
      viewport.canvasScale = canvas.scale
    })

    this.duration = 10

    {
      let text = new Text('Hello world!')
      viewport.addChild(text)
      text.fontSize.defaultValue = 64
      text.align = 'center'
      text.baseline = 'middle'
      text.transform.scaleX.addKey(0, 0)
      text.transform.scaleY.addKey(0, 0)
      text.opacity.addKey(0, 0)
      text.transform.scaleX.addKey(1, 1, Trace.Easing.easeOutExpo)
      text.transform.scaleY.addKey(1, 1, Trace.Easing.easeOutExpo)
      text.opacity.addKey(1, 1, Trace.Easing.easeOutExpo)
      text.transform.translateX.addKey(1, 960)
      text.transform.translateX.addKey(2, 960 + 50, Trace.Easing.easeOutExpo)
      text.transform.translateY.addKey(0, 540)
      text.clip.addKey(1, 0)
      text.clip.addKey(2, 1, Trace.Easing.easeOutExpo)
      text.enabled.addKey(0, true)
      text.enabled.addKey(2, false)
    }
    {
      let text = new Text('This is an example')
      viewport.addChild(text)
      text.fontSize.defaultValue = 64
      text.align = 'center'
      text.baseline = 'middle'
      text.transform.translateX.addKey(1, 960 - 50)
      text.transform.translateX.addKey(2, 960, Trace.Easing.easeOutExpo)
      text.transform.translateY.addKey(0, 540)
      text.clip.addKey(1, -1)
      text.clip.addKey(2, 0, Trace.Easing.easeOutExpo)
      text.enabled.addKey(0, false)
      text.enabled.addKey(1, true)
      text.enabled.addKey(3, false)
      text.blur.addKey(2, 0)
      text.blur.addKey(3, 20, Trace.Easing.easeInExpo)
      text.transform.scaleX.addKey(2, 1)
      text.transform.scaleY.addKey(2, 1)
      text.transform.scaleX.addKey(3, 2, Trace.Easing.easeInExpo)
      text.transform.scaleY.addKey(3, 2, Trace.Easing.easeInExpo)
      text.opacity.addKey(2, 1)
      text.opacity.addKey(3, 0, Trace.Easing.easeInExpo)
    }
    {
      let createStreak = function (time, angle, color, width, length, distance, blur, lines) {
        let burst = new Burst()
        viewport.addChild(burst)
        burst.transform.translateX.addKey(0, 960)
        burst.transform.translateY.addKey(0, 540)
        burst.lines.addKey(0, lines || 1)
        burst.lineWidth.addKey(0, width)
        burst.angleOffset.addKey(0, angle)
        burst.stroke.addKey(0, color)
        burst.fill.addKey(0, '')
        burst.inner.addKey(time, 10)
        burst.outer.addKey(time, 10)
        burst.inner.addKey(time + 0.5, distance, Trace.Easing.easeOutExpo)
        burst.outer.addKey(time + 0.5, distance + length, Trace.Easing.easeOutExpo)
        burst.blur.addKey(time + 0.3, 0)
        burst.blur.addKey(time + 0.5, blur)
        burst.opacity.addKey(time + 0.3, 1)
        burst.opacity.addKey(time + 0.5, 0)
        burst.enabled.addKey(0, false)
        burst.enabled.addKey(time, true)
        burst.enabled.addKey(time + 0.5, false)
      }
      createStreak(1.8, 1, '#f54784', 5, 200, 100, 10)
      createStreak(2.1, -2, '#f54784', 5, 200, 100, 10)
      createStreak(2.4, 3, '#f54784', 5, 200, 100, 10)
      createStreak(2.5, -1, '#f54784', 5, 200, 100, 10)
      createStreak(2.55, 1.5, '#f54784', 5, 200, 130, 10)
      createStreak(2.57, 4.7, '#f54784', 5, 160, 90, 10)
      createStreak(2.58, 6, '#f54784', 5, 220, 100, 10)

      let rand = a => {
        let r = 0
        for (let i of a.toString()) {
          r = (r << 5) - r + i
          r &= r
        }
        return Math.abs((r / 65536) % 1)
      }

      let i = 2.59
      let n = 0
      while (i < 4) {
        let randA = rand(i) * (Math.PI * 2)
        let randB = rand(i + 0.1)
        let randC = rand(i + 0.2)
        createStreak(i, randA, '#f54784', 5 * randB, 300 * randB, 300 * randC, 10)
        n++

        if (n >= 4000) break

        if (i < 3) i += (3 - i) / 10 + 0.001
        else i += 0.01
      }
      createStreak(4, 1, '#f54784', 5, 432, 123, 10, 7)

      let burst = new Burst()
      viewport.addChild(burst)
      burst.fill.addKey(0, '#fff')
      burst.transform.translateX.addKey(3, 960)
      burst.transform.translateY.addKey(3, 540)
      burst.zIndex.addKey(0, -3)
      burst.inner.addKey(4, 100)
      burst.outer.addKey(4, 100)
      burst.inner.addKey(4.5, 0, Trace.Easing.easeOutExpo)
      burst.outer.addKey(4.5, 1102, Trace.Easing.easeOutExpo)
    }
    {
      let background = new SceneBackground()
      viewport.addChild(background)
      background.state.addKey(4.3, 0)
      background.state.addKey(5.3, 1, Trace.Easing.easeOutExpo)
      background.enabled.addKey(0, false)
      background.enabled.addKey(4.3, true)
    }
  }
}

module.exports = {
  title: 'Example',
  Main: Main,
  timeline: true,
  autorun: true,
  autoplay: true
}
