const glMatrix = require('gl-matrix')
const TraceObject = require('./Object')
const Utils = require('./Utils')

class Viewport extends TraceObject {
  constructor () {
    super()

    this.width = 960
    this.height = 540
    this.canvasWidth = 960
    this.canvasHeight = 540
    this.canvasScale = 1
    this.contentSize = 'contain'
    this.backgroundColor = ''
    this.marginColor = ''
  }

  getContentPos () {
    let scale = 1
    if (this.contentSize === 'contain') {
      scale = Math.min(this.canvasWidth / this.width, this.canvasHeight / this.height)
    } else if (this.contentSize === 'cover') {
      scale = Math.max(this.canvasWidth / this.width, this.canvasHeight / this.height)
    } else return { x: 0, y: 0, scale: 0 }

    let x = (this.canvasWidth - (this.width * scale)) / 2
    let y = (this.canvasHeight - (this.height * scale)) / 2

    return {
      x: x,
      y: y,
      scale: scale
    }
  }

  draw (ctx, parentTransform, currentTime, deltaTime) {
    let rawTransform = this.transform.getMatrix(currentTime, deltaTime)
    let transform = glMatrix.mat3.create()
    glMatrix.mat3.multiply(transform, parentTransform, rawTransform)

    let size = this.getContentPos()
    let dp = this.canvasScale
    glMatrix.mat3.translate(transform, transform, [size.x * dp, size.y * dp])
    glMatrix.mat3.scale(transform, transform, [size.scale * dp, size.scale * dp])

    this.drawSelf(ctx, transform, currentTime, deltaTime)
    this.drawChildren(ctx, transform, currentTime, deltaTime)
    this.drawMargin(ctx, transform, currentTime, deltaTime)
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    ctx.globalAlpha = 1
    let dp = this.canvasScale

    Utils.resetCtx(ctx)
    ctx.resetTransform()
    ctx.clearRect(0, 0, this.canvasWidth * dp, this.canvasHeight * dp)

    let pos = this.getContentPos()
    ctx.clearRect(pos.x * dp, pos.y * dp, pos.scale * this.width * dp,
      pos.scale * this.height * dp)

    // fill content area with background color
    if (this.backgroundColor) {
      ctx.fillStyle = this.backgroundColor
      ctx.fillRect(pos.x * dp, pos.y * dp, pos.scale * this.width * dp,
        pos.scale * this.height * dp)
    }
  }

  drawMargin (ctx, transform, currentTime, deltaTime) {
    ctx.globalAlpha = 1
    let dp = this.canvasScale

    Utils.resetCtx(ctx)
    ctx.resetTransform()

    let pos = this.getContentPos()

    ctx.fillStyle = this.marginColor
    let doFill = !!this.marginColor
    if (pos.x > 0) {
      ctx.clearRect(0, 0, pos.x * dp, this.canvasHeight * dp)
      if (doFill) ctx.fillRect(0, 0, pos.x * dp, this.canvasHeight * dp)
      ctx.clearRect((this.canvasWidth - pos.x) * dp, 0, pos.x * dp, this.canvasHeight * dp)
      if (doFill) {
        ctx.fillRect((this.canvasWidth - pos.x) * dp, 0, pos.x * dp,
          this.canvasHeight * dp)
      }
    }
    if (pos.y > 0) {
      ctx.clearRect(pos.x * dp, 0, (this.canvasWidth - 2 * pos.x) * dp, pos.y * dp)
      if (doFill) ctx.fillRect(pos.x * dp, 0, (this.canvasWidth - 2 * pos.x) * dp, pos.y * dp)
      ctx.clearRect(pos.x * dp, (this.canvasHeight - pos.y) * dp,
        (this.canvasWidth - 2 * pos.x) * dp, pos.y * dp)
      if (doFill) {
        ctx.clearRect(pos.x * dp, (this.canvasHeight - pos.y) * dp,
          (this.canvasWidth - 2 * pos.x) * dp, pos.y * dp)
      }
    }
  }
}
module.exports = Viewport
