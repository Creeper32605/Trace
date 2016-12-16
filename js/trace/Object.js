const EventEmitter = require('events')
const stable = require('stable')
const glMatrix = require('gl-matrix')
const Transform = require('./Transform')
const AnimatedNumber = require('./AnimatedNumber')
const AnimatedBoolean = require('./AnimatedBoolean')
const Utils = require('./Utils')

class TraceObject extends EventEmitter {
  constructor () {
    super()

    this.parentNode = null
    this.transform = new Transform()
    this.opacity = new AnimatedNumber(1)
    this.enabled = new AnimatedBoolean(true)
    this.zIndex = new AnimatedNumber(0)
    this.children = new Set()
  }

  drawChildren (ctx, transform, currentTime, deltaTime) {
    let values = new Map()
    for (let i of this.children.values()) {
      values.set(i, [i.zIndex.getValue(currentTime, deltaTime),
        i.enabled.getValue(currentTime, deltaTime)])
    }
    let sortedChildren = stable([...values.keys()], (a, b) => {
      return values.get(a)[0] > values.get(b)[0]
    })

    for (let node of sortedChildren) {
      if (values.get(node)[1] === true) {
        node.draw(ctx, transform, currentTime, deltaTime)
      }
    }
  }

  draw (ctx, parentTransform, currentTime, deltaTime) {
    let rawTransform = this.transform.getMatrix(currentTime, deltaTime)
    let transform = glMatrix.mat3.create()
    glMatrix.mat3.multiply(transform, parentTransform, rawTransform)

    this.drawSelf(ctx, transform, currentTime, deltaTime)
    this.drawChildren(ctx, transform, currentTime, deltaTime)
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    // placeholder -- subclasses should replace this with something else
    Utils.setTransformMatrix(ctx, transform)
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#637bc5'
    ctx.font = '10px Fira Mono, Menlo, Monaco, Inconsolata, Consolas, ' +
      'Lucida Console, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.globalAlpha = this.opacity.getValue(currentTime, deltaTime)
    ctx.globalCompositeOperation = 'source-over'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineDashOffset = 0
    ctx.setLineDash([])
    ctx.strokeText('[Object]', 0, 0)
    ctx.fillText('[Object]', 0, 0)
    ctx.fillStyle = '#4ebc6b'
    ctx.beginPath()
    ctx.arc(0, 0, 1, 0, 2 * Math.PI)
    ctx.fill()
  }

  addChild (childNode) {
    if (childNode.parentNode !== null && childNode.parentNode !== this) {
      throw new Error('Child node already has a parent')
    }
    if (!(childNode instanceof TraceObject)) {
      throw new Error('Child node is not a Trace Object')
    }
    this.children.add(childNode)
    childNode.parentNode = this
  }
  removeChild (childNode) {
    return this.children.delete(childNode)
  }
  hasChild (childNode) {
    return this.children.has(childNode)
  }

  closest (fn) {
    if (fn(this)) return this
    if (this.parentNode) return this.parentNode.closest(fn)
    return null
  }
}
module.exports = TraceObject
