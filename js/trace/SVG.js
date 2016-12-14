const {parseSVG} = require('svg-parser')
const TraceObject = require('./Object')
const Utils = require('./Utils')

class SVG extends TraceObject {
  constructor (data) {
    super()
    this['[[svg]]'] = data ? data.toString() : ''
    if (this['[[svg]]']) this.parse()
    this.svgData = {}
  }
  parse () {
    this.svgData = parseSVG(this['[[svg]]'])
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    Utils.resetCtx(ctx)
    Utils.setTransformMatrix(ctx, transform)

    // let opacity = this.opacity.getValue(currentTime, deltaTime)

    // todo: make it magically render svg
  }
}
module.exports = SVG
