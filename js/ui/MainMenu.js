const Trace = require('../trace')

class TraceTitle extends Trace.Object {
  constructor () {
    super()

    this.state = new Trace.AnimatedNumber(0)
    this.rainbowTimer = 0
  }

  getRainbowScale (time) {
    return 0.2 * Math.sin(2 * time) + 1.2
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    Trace.Utils.resetCtx(ctx)
    Trace.Utils.setTransformMatrix(ctx, transform)
    let state = this.state.getValue(currentTime, deltaTime)

    this.rainbowTimer += deltaTime

    let skew = 7 * state
    let width = (60 * state) + skew
    let height = 25

    let rainbow = ['#f54784', '#ed9b50', '#4ebc6b', '#43c5e5', '#637bc5', '#8c63d9']
    for (let i = rainbow.length - 1; i >= 0; i--) {
      ctx.fillStyle = rainbow[i]
      ctx.beginPath()
      let rwidth = width * (1 + (i + 1) / (rainbow.length + 1)) *
        this.getRainbowScale(this.rainbowTimer - i / 3)
      ctx.moveTo(-rwidth / 2 + skew, -height / 2)
      ctx.lineTo(rwidth / 2 + skew, -height / 2)
      ctx.lineTo(rwidth / 2 - skew, height / 2)
      ctx.lineTo(-rwidth / 2 - skew, height / 2)
      ctx.fill()
    }

    ctx.save()

    ctx.beginPath()
    ctx.moveTo(-width / 2 + skew, -height / 2)
    ctx.lineTo(width / 2 + skew, -height / 2)
    ctx.lineTo(width / 2 - skew, height / 2)
    ctx.lineTo(-width / 2 - skew, height / 2)
    ctx.clip()

    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '18px Avenir Next, Avenir, BlinkMacSystemFont, Helvetica, Roboto, Segoe UI, Arial, sans-serif'
    ctx.fillText('Trace', 0, 0)

    ctx.restore()
  }
}

class MainMenu extends Trace.Object {
  constructor (canvas) {
    super()

    this.ctx = canvas.ctx

    this.timeline = new Trace.Timeline(this.ctx)
    this.viewport = new Trace.Viewport()

    this.viewport.width = 500
    this.viewport.height = 500

    this.viewport.canvasWidth = canvas.width
    this.viewport.canvasHeight = canvas.height
    this.viewport.canvasScale = canvas.scale

    canvas.on('resize', () => {
      this.viewport.canvasWidth = canvas.width
      this.viewport.canvasHeight = canvas.height
      this.viewport.canvasScale = canvas.scale
    })

    this.timeline.addChild(this.viewport)
    this.timeline.duration = 3

    {
      let title = new TraceTitle()
      this.viewport.addChild(title)
      title.state.addKey(0, 0)
      title.state.addKey(2, 1, Trace.Easing.easeOutExpo)
      title.transform.scaleX.defaultValue = 2
      title.transform.scaleY.defaultValue = 2
      title.transform.translateX.defaultValue = 250
      title.transform.translateY.addKey(0.5, 250)
      title.transform.translateY.addKey(3, 150, Trace.Easing.easeInOutExpo)
    }

    this.timeline.run()
    this.timeline.play()
  }
}
module.exports = MainMenu
