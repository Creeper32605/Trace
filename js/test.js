let Trace = require('./js/trace')
let TitleBar = require('./js/ui/TitleBar')

let bar
if (process.platform === 'darwin') {
  bar = new TitleBar()
  bar.style.webkitAppRegion = 'drag'
  bar.style.height = '23px'
  bar.style.width = '100%'
  bar.style.top = '0'
  bar.style.left = '0'
  bar.style.position = 'fixed'
  bar.style.zIndex = '1'
  document.body.appendChild(bar)
  bar.update()

  window.addEventListener('resize', () => {
    bar.update()
  })
}

let ctx
let mainCanvas
{
  mainCanvas = document.createElement('canvas')
  mainCanvas.style.position = 'fixed'
  mainCanvas.style.top = '0'
  mainCanvas.style.left = '0'
  mainCanvas.style.width = '100%'
  mainCanvas.style.height = '100%'
  document.body.appendChild(mainCanvas)
  ctx = mainCanvas.getContext('2d')

  let resizeCanvas = function () {
    let rect = mainCanvas.getBoundingClientRect()
    let dp = window.devicePixelRatio
    mainCanvas.width = rect.width * dp
    mainCanvas.height = rect.height * dp
  }
  window.addEventListener('resize', resizeCanvas)
  resizeCanvas()
}

let obj = new Trace.Object()
obj.opacity.addKey(0, 0)
obj.opacity.addKey(1, 1)
obj.transform.translateX.addKey(1, 480)
obj.transform.translateY.addKey(0, 270)
obj.transform.scaleX.addKey(0, 1)
obj.transform.scaleY.addKey(0, 1)
obj.transform.scaleX.addKey(1, 2, Trace.Easing.easeOutExpo)
obj.transform.scaleY.addKey(1, 2, Trace.Easing.easeOutExpo)
obj.transform.translateX.addKey(2, 280, Trace.Easing.step)
obj.transform.translateX.addKey(3, 280)
obj.transform.translateX.addKey(4, 680, Trace.Easing.easeInExpo)
obj.transform.translateX.interpolator = Trace.AnimatedNumber.springInterpolator
obj.transform.translateX.interpolatorSettings.spring = [500, 20]

let viewport = new Trace.Viewport()
viewport.addChild(obj)

let icon = new Trace.Icon()
viewport.addChild(icon)
icon.transform.translateX.addKey(0, 480)
icon.transform.translateY.addKey(0, 270)
icon.animation.addKey(0, 0)
icon.animation.addKey(1, 1)
icon.zIndex.addKey(0, -1)

viewport.canvasWidth = mainCanvas.getBoundingClientRect().width
viewport.canvasHeight = mainCanvas.getBoundingClientRect().height
viewport.canvasScale = window.devicePixelRatio

window.addEventListener('resize', () => {
  viewport.canvasWidth = mainCanvas.getBoundingClientRect().width
  viewport.canvasHeight = mainCanvas.getBoundingClientRect().height
  viewport.canvasScale = window.devicePixelRatio
})

let timeline = new Trace.Timeline(ctx)
timeline.addChild(viewport)
console.log(timeline)
timeline.duration = 6
timeline.loop = true

timeline.run()
timeline.play()

window.addEventListener('keydown', e => {
  if (e.which === 0x41) timeline.currentTime = 0
})
