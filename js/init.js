const {ipcRenderer} = require('electron')
const {dialog} = require('electron').remote
const path = require('path')
const TitleBar = require('./js/ui/TitleBar')
const TimelineControls = require('./js/ui/TimelineControls')
const MainCanvas = require('./js/ui/MainCanvas')
const MainMenu = require('./js/ui/MainMenu')
const loader = require('./js/loader')

// todo: clean up

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

{
  let canDrop = true
  document.body.addEventListener('dragover', e => {
    e.preventDefault()
    if (mainMenu !== null && canDrop) {
      mainMenu.dropZone.dropState.defaultValue = 1

      let files = e.dataTransfer.files
      if (files.length > 1) {
        mainMenu.dropZone.tooManyFiles.defaultValue = 1
      } else {
        mainMenu.dropZone.tooManyFiles.defaultValue = 0

        let file = files[0]
        let filePath = path.parse(file.path)
        if (filePath.ext && filePath.ext !== '.js') {
          mainMenu.dropZone.wrongType.defaultValue = 1
        } else mainMenu.dropZone.wrongType.defaultValue = 0
      }
    }
  })
  let stopDrag = function (e) {
    e.preventDefault()
    if (mainMenu !== null) {
      mainMenu.dropZone.dropState.defaultValue = 0
      mainMenu.dropZone.tooManyFiles.defaultValue = 0
      mainMenu.dropZone.wrongType.defaultValue = 0
    }
  }
  document.body.addEventListener('dragleave', stopDrag)
  document.body.addEventListener('dragend', stopDrag)
  document.body.addEventListener('drop', e => {
    e.preventDefault()
    if (mainMenu !== null && canDrop) {
      mainMenu.dropZone.tooManyFiles.defaultValue = 0
      mainMenu.dropZone.wrongType.defaultValue = 0

      let files = e.dataTransfer.files
      let firstExt = path.parse(files[0].path).ext
      if (files.length > 1 || (firstExt && firstExt !== '.js')) {
        mainMenu.dropZone.dropState.defaultValue = 0
        return
      }
      canDrop = false
      mainMenu.dropZone.dropState.defaultValue = 2
      setTimeout(() => {
        // move this somewhere else
        let filePath = files[0].path
        let indexPath
        try {
          indexPath = loader.resolve.sync(files[0].path, { basedir: filePath.dir })
        } catch (err) {
          dialog.showMessageBox({
            message: 'Error',
            detail: 'Could not resolve main file path',
            buttons: ['OK'],
            cancelId: 0,
            defaultId: 0
          })
          return
        }

        if (path.parse(indexPath).ext !== '.js') {
          dialog.showMessageBox({
            message: 'Invalid',
            detail: `${path.parse(indexPath).base} is not a valid file`,
            buttons: ['OK'],
            cancelId: 0,
            defaultId: 0
          })
          return
        }

        mainMenu.timeline.duration = 4
        mainMenu.timeline.play()
        mainMenu.timeline.once('end', () => {
          mainMenu.timeline.stop()
          mainMenu = null
          {
            title.setTitle(filePath.name)
            let exp = loader.load(filePath.name, indexPath)
            if (typeof exp.Main !== 'function') {
              dialog.showMessageBox({
                message: 'No Main Class',
                buttons: ['OK'],
                cancelId: 0,
                defaultId: 0
              })
              return
            }
            let instance = new (exp.Main)(mainCanvas.proxy)
            if (exp.timeline) {
              timeline.bar.disabled = false
              timeline.bar.hidden = false
              timeline.bar.timeline = instance
            }
            if (exp.title) title.setTitle(exp.title)
            if (exp.autorun) instance.run()
            if (exp.autoplay) instance.play()
          }
        })
      }, 100)
    }
  })
}
