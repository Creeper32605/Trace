const TraceObject = require('./Object')

let identityTransform = [1, 0, 0, 0, 1, 0, 0, 0, 1]

class Timeline extends TraceObject {
  constructor (ctx) {
    super()

    this.currentTime = 0
    this.playbackRate = 1
    this.paused = true
    this.duration = null
    this.loop = false
    this.timeoutFunction = typeof window !== 'undefined'
      ? f => window.requestAnimationFrame(f)
      : f => setTimeout(f, 16.7)
    this.lastLoopTime = 0

    this.ctx = ctx || null
    this.running = false
  }

  drawLoop () {
    if (this.running) this.timeoutFunction(() => this.drawLoop())
    let now = Date.now()
    let dt = (now - this.lastLoopTime) / 1000
    this.lastLoopTime = now

    if (!this.paused) {
      this.currentTime += dt * this.playbackRate
      this.emit('timeupdate')

      if (this.duration !== null && this.currentTime >= this.duration) {
        if (this.loop) {
          this.currentTime = 0
        } else {
          this.currentTime = this.duration
          this.pause()
          this.emit('end')
        }
      }
      if (this.playbackRate < 0 && this.currentTime <= 0) {
        if (this.loop && this.duration !== null) {
          this.currentTime = this.duration
        } else {
          this.currentTime = 0
          this.pause()
          this.emit('end')
        }
      }
    }

    if (!this.ctx) return
    this.draw(this.ctx, identityTransform, this.currentTime, dt)
    this.emit('loopend')
  }

  play () {
    if (this.paused) {
      this.paused = false
      this.emit('play')
      return true
    } else return false
  }

  pause () {
    if (!this.paused) {
      this.paused = true
      this.emit('pause')
      return true
    } else return false
  }

  run () {
    if (!this.running) {
      this.running = true
      this.lastLoopTime = Date.now()
      this.drawLoop()
      this.emit('run')
      return true
    } else return false
  }

  stop () {
    if (this.running) {
      this.running = false
      this.emit('stop')
      return true
    } else return false
  }

  drawSelf (ctx, transform, currentTime, deltaTime) {
    return
  }
}
module.exports = Timeline
