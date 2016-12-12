const {ipcRenderer} = require('electron')
const TitleBar = require('./js/ui/TitleBar')
const TimelineControls = require('./js/ui/TimelineControls')
const MainCanvas = require('./js/ui/MainCanvas')
const MainMenu = require('./js/ui/MainMenu')
const loader = require('./js/loader')

let title = {
  text: 'Trace',
  setTitle: function (s) {
    document.head.querySelector('title').textContent = s
    title.text = s
    title.setBarTitle(s)
  },
  setBarTitle: function (s) {}
}
if (process.platform === 'darwin') {
  let bar = new TitleBar()
  document.body.appendChild(bar)

  title.bar = bar
  title.setBarTitle = function (s) {
    bar.titleText.text = s
  }

  window.addEventListener('resize', () => bar.update())

  ipcRenderer.on('fullscreen', (e, isFullscreen) => {
    if (isFullscreen) bar.classList.add('hidden')
    else bar.classList.remove('hidden')
  })
}

let timeline = {}
timeline.bar = new TimelineControls()
timeline.bar.hidden = true
timeline.bar.disabled = true
document.body.appendChild(timeline.bar)
window.addEventListener('resize', () => timeline.bar.update())

ipcRenderer.on('playpause', () => {
  if (timeline.bar.timeline.paused) timeline.bar.timeline.play()
  else timeline.bar.timeline.pause()
})
ipcRenderer.on('runstop', () => {
  if (timeline.bar.timeline.running) timeline.bar.timeline.stop()
  else timeline.bar.timeline.run()
})
{
  let timeout = -1
  window.addEventListener('mousemove', e => {
    if (e.pageY > window.innerHeight - 56) {
      timeline.bar.hidden = false
      clearTimeout(timeout)
    } else {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        timeline.bar.hidden = true
      }, 2000)
    }
  })
}

let mainCanvas = new MainCanvas()
document.body.appendChild(mainCanvas)

let mainMenu = new MainMenu(mainCanvas.proxy)
