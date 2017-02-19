const Trace = require('trace-api')

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

    ctx.globalAlpha = this.opacity.getValue(currentTime, deltaTime)

    this.rainbowTimer += deltaTime

    let skew = 7 * state
    let width = (60 * state) + skew
    let height = 25

    let rainbow = ['#f54784', '#ed9b50', '#4ebc6b', '#43c5e5', '#637bc5',
      '#8c63d9']
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
    ctx.font = '18px Avenir Next, Avenir, BlinkMacSystemFont, Helvetica, ' +
      'Roboto, Segoe UI, Arial, sans-serif'
    ctx.fillText('Trace', 0, 0)

    ctx.restore()
  }
}

class DropZone extends Trace.Object {
  constructor () {
    super()

    this.dropState = new Trace.AnimatedNumber(0)
    this.dropState.interpolator = Trace.AnimatedNumber.springInterpolator
    this.dropState.interpolatorSettings.spring = [300, 50]
    this.tooManyFiles = new Trace.AnimatedNumber(0)
    this.tooManyFiles.interpolator = Trace.AnimatedNumber.springInterpolator
    this.tooManyFiles.interpolatorSettings.spring = [300, 50]
    this.wrongType = new Trace.AnimatedNumber(0)
    this.wrongType.interpolator = Trace.AnimatedNumber.springInterpolator
    this.wrongType.interpolatorSettings.spring = [300, 50]
    this.dashOffsetTimer = 0
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    Trace.Utils.resetCtx(ctx)
    Trace.Utils.setTransformMatrix(ctx, transform)

    let opacity = this.opacity.getValue(currentTime, deltaTime)

    let dropState = this.dropState.getValue(currentTime, deltaTime)
    this.dashOffsetTimer += deltaTime
    let tooManyFiles = this.tooManyFiles.getValue(currentTime, deltaTime)
    let wrongType = this.wrongType.getValue(currentTime, deltaTime)

    let file = new window.Path2D('M -20,-28 v 56 h 40 v -46 l -10,-10 z M ' +
      '10,-28 v 10 h 10')

    ctx.globalAlpha = opacity
    ctx.lineWidth = 1
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#fff'

    if (dropState < 0.5) {
      ctx.setLineDash([4, 5 * (1 - dropState * 2)])
      ctx.lineDashOffset = this.dashOffsetTimer
    }

    ctx.stroke(file)

    ctx.save()
    ctx.clip(file)

    let fileData = [[0, 5], [0, 8], [1, 3], [1, 9], [2, 5], [3, 8], [3, 3],
      [2, 6], [2, 3], [3, 10]]
    let rainbow = ['#f54784', '#ed9b50', '#4ebc6b', '#43c5e5', '#637bc5',
      '#8c63d9']
    let visibleData = dropState * 10
    let highlightData = Math.max(0, dropState - 1) * 10
    ctx.globalAlpha *= Math.max(0, 1 - tooManyFiles - wrongType)

    for (let i = 0; i < 10; i++) {
      if (i >= visibleData - 0.5) continue
      let y = -27 + 5 * (i + 1)
      let left = -16 + fileData[i][0] * 3
      let right = left + (fileData[i][1] * 2) * Math.min(1, (visibleData - i))
      ctx.strokeStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(left, y)
      ctx.lineTo(right, y)
      ctx.stroke()
      if (i < highlightData - 0.5) {
        let rightHighlight = left + (fileData[i][1] * 2) * Math.min(1,
          (highlightData - i))
        ctx.strokeStyle = rainbow[i % rainbow.length]
        ctx.beginPath()
        ctx.moveTo(left, y)
        ctx.lineTo(rightHighlight, y)
        ctx.stroke()
      }
    }

    ctx.restore()

    if (this.tooManyFiles.defaultValue || this.wrongType.defaultValue ||
        tooManyFiles > 0.1 || wrongType > 0.1) {
      ctx.globalAlpha = opacity * (tooManyFiles + wrongType)
      ctx.strokeStyle = '#f44336'
      ctx.fillStyle = '#f44336'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '700 7px Avenir Next, Avenir, BlinkMacSystemFont, ' +
        'Helvetica, Roboto, Segoe UI, Arial, sans-serif'
      ctx.stroke(file)

      if (tooManyFiles) {
        for (let i = -2; i <= 2; i++) {
          if (i === 0) continue
          ctx.globalAlpha = opacity * tooManyFiles * 1 / (1 + Math.abs(i))
          ctx.save()
          ctx.translate(10 * i * tooManyFiles, -10 * i * tooManyFiles)
          ctx.stroke(file)
          ctx.restore()
        }

        ctx.globalAlpha = opacity * tooManyFiles
        ctx.scale(0.9, 0.9)
        ctx.fillText('TOO MANY', 0, 15)
      }
      if (wrongType) {
        ctx.globalAlpha = opacity * wrongType
        ctx.save()
        ctx.translate(0, -5)
        ctx.stroke(new window.Path2D('M 0,-10 l 12,20 h -24 l 12,-20 M 0,-5 ' +
          'v 10 M 0,7 v 1'))
        ctx.fillText('TYPE', 0, 20)
        ctx.restore()
      }
    }
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
      title.addKeys({
        state: {
          0: 0,
          2: [1, Trace.Easing.easeOutExpo],
          3: Trace.AnimatedValue.PREV_KEY,
          4: [0, Trace.Easing.easeInExpo]
        },
        zIndex: 1,
        transform: {
          scaleX: 2,
          scaleY: 2,
          translateX: 250,
          translateY: {
            0.5: 250,
            3: [150, Trace.Easing.easeInOutExpo],
            4: [50, Trace.Easing.easeInExpo]
          }
        }
      })
    }

    {
      let zone = new DropZone()
      this.dropZone = zone
      this.viewport.addChild(zone)
      zone.addKeys({
        transform: {
          translateX: 250,
          translateY: 300,
          scaleX: {
            2: 0,
            3: [2, Trace.Easing.easeOutExpo],
            4: [6, Trace.Easing.easeInExpo]
          },
          scaleY: {
            2: 0,
            3: [2, Trace.Easing.easeOutExpo],
            4: [6, Trace.Easing.easeInExpo]
          }
        },
        opacity: {
          2: 0,
          3: [1, Trace.Easing.easeOutExpo],
          4: [0, Trace.Easing.easeInExpo]
        }
      })
    }

    this.timeline.run()
    this.timeline.play()
  }
}
module.exports = MainMenu
