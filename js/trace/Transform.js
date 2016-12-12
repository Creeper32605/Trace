const glMatrix = require('gl-matrix')
const AnimatedNumber = require('./AnimatedNumber')

class Transform {
  constructor () {
    this.translateX = new AnimatedNumber(0)
    this.translateY = new AnimatedNumber(0)
    this.translateZ = new AnimatedNumber(0)
    this.rotateX = new AnimatedNumber(0)
    this.rotateY = new AnimatedNumber(0)
    this.rotateZ = new AnimatedNumber(0)
    this.skewX = new AnimatedNumber(0)
    this.skewY = new AnimatedNumber(0)
    this.skewZ = new AnimatedNumber(0)
    this.scaleX = new AnimatedNumber(1)
    this.scaleY = new AnimatedNumber(1)
    this.scaleZ = new AnimatedNumber(1)
  }

  getMatrix (currentTime, deltaTime) {
    let matrix = glMatrix.mat3.create()

    let translateX = this.translateX.getValue(currentTime, deltaTime)
    let translateY = this.translateY.getValue(currentTime, deltaTime)
    let rotateZ = this.rotateZ.getValue(currentTime, deltaTime)
    let skewX = this.skewX.getValue(currentTime, deltaTime)
    let skewY = this.skewY.getValue(currentTime, deltaTime)
    let scaleX = this.scaleX.getValue(currentTime, deltaTime)
    let scaleY = this.scaleY.getValue(currentTime, deltaTime)

    glMatrix.mat3.translate(matrix, matrix, [translateX, translateY])
    glMatrix.mat3.rotate(matrix, matrix, rotateZ)
    glMatrix.mat3.scale(matrix, matrix, [scaleX, scaleY])

    let skewMatrix = glMatrix.mat3.fromValues(1, skewY, 0, skewX, 1, 0, 0, 0, 1)

    glMatrix.mat3.multiply(matrix, matrix, skewMatrix)

    return matrix
  }
}
module.exports = Transform
