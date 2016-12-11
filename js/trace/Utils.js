class Utils {
  constructor () {
    throw new Error('Invalid')
  }

  static setTransformMatrix (ctx, matrix) {
    ctx.setTransform(matrix[0], matrix[1], matrix[3], matrix[4], matrix[6], matrix[7])
  }
}
module.exports = Utils
