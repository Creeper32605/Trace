const TraceObject = require('./Object')
const AnimatedNumber = require('./AnimatedNumber')
const Easing = require('./Easing')
const Utils = require('./Utils')

class TraceIcon extends TraceObject {
  constructor () {
    super()

    this.radius = new AnimatedNumber(100)

    this.animation = new AnimatedNumber(1)
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    Utils.setTransformMatrix(ctx, transform)

    // todo: animation
    // scale in upside down trangle
    // move triangle to right
    // triangle circles around and creates dots (make sure dots look like a tangent trail)
    // scale in circle

    let radius = this.radius.getValue(currentTime, deltaTime)
    let animation = 1

    ctx.fillStyle = '#fee12a'
    let arcRadius = radius * 1.2
    for (let i = 0; i < 16; i++) {
      let angle = i / 8 * Math.PI - Math.PI / 2 - 0.13
      let dotRadius = radius / 20
      let a = Easing.easeOutExpo(Math.max(0, (2 * animation - i / 16) * 1))

      ctx.beginPath()
      ctx.arc(a * arcRadius * Math.cos(angle), a * arcRadius * Math.sin(angle), a * dotRadius,
        0, 2 * Math.PI)
      ctx.fill()
    }

    ctx.fillStyle = '#f54784'
    ctx.beginPath()
    ctx.arc(0, 0, radius * Easing.easeOutExpo(Math.max(0, Math.min(1, 2 * animation - 1))),
      0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = '#fee12a'
    let triangleSize = 2 * radius * Easing.easeOutExpo(Math.min(1, 2 * animation))
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(triangleSize * Math.cos(-Math.PI / 3), triangleSize * Math.sin(-Math.PI / 3))
    ctx.lineTo(triangleSize, 0)
    ctx.lineTo(0, 0)
    ctx.fill()
  }
}
module.exports = TraceIcon
