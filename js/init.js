const { ipcRenderer: ipc, remote: { dialog } } = require('electron')
const path = require('path')

const MainCanvas = require('./ui/main-canvas')
const MainMenu = require('./ui/main-menu')
const TitleBar = require('./ui/title-bar')
const TimelineControls = require('./ui/timeline-controls')

{
  let titleBar = new TitleBar()
  document.body.appendChild(titleBar)
  titleBar.addEventListener('titleupdate', () => {
    document.head.querySelector('title').textContent = titleBar.title
  })
  window.addEventListener('resize', () => titleBar.update())

  ipc.on('fullscreen', (e, isFullscreen) => {
    if (isFullscreen) titleBar.classList.add('hidden')
    else titleBar.classList.remove('hidden')
  })

  let timelineControls = new TimelineControls()
  timelineControls.hidden = true
  timelineControls.disabled = true
  document.body.appendChild(timelineControls)

  window.addEventListener('resize', () => timelineControls.update())

  ipc.on('playpause', () => {
    if (timelineControls.paused) timelineControls.play()
    else timelineControls.pause()
  })
  ipc.on('runstop', () => {
    if (timelineControls.running) timelineControls.stop()
    else timelineControls.run()
  })
  ipc.on('prevstop', () => {
    timelineControls.nextMarker(-Infinity, (marker, current, currentTime) => {
      return marker[0] > current && marker[0] < currentTime
    })
  })
  ipc.on('nextstop', () => {
    timelineControls.nextMarker(Infinity, (marker, current, currentTime) => {
      return marker[0] < current && marker[0] > currentTime
    })
  })

  let hideTimeout = -1
  window.addEventListener('mousemove', e => {
    clearTimeout(hideTimeout)
    if (e.pageY > window.innerHeight - 56) {
      timelineControls.hidden = false
    } else {
      hideTimeout = setTimeout(() => {
        timelineControls.hidden = true
      }, 2000)
    }
  })

  let mainCanvas = new MainCanvas()
  document.body.appendChild(mainCanvas)
  let mainMenu = new MainMenu(mainCanvas.proxy)
  window.mainMenu = mainMenu

  {
    let canDrop = true

    let stopDrag = function (e) {
      if (mainMenu !== null) {
        e.preventDefault()
        mainMenu.dropZone.dropState.defaultValue = 0
        mainMenu.dropZone.tooManyFiles.defaultValue = 0
        mainMenu.dropZone.wrongType.defaultValue = 0
      }
    }

    let run = function (file) {
      let name = path.parse(file.path).base
      try {
        let main = require(file.path)
        let instance = new main.Main(mainCanvas.proxy)
        titleBar.title = main.title
        if (main.timeline) {
          timelineControls.timeline = instance
          timelineControls.disabled = false
        }
        window.instance = instance // for console access
      } catch (err) {
        console.error(err)
        dialog.showMessageBox({
          type: 'error',
          buttons: ['Close', 'Continue'],
          defaultId: 0,
          title: 'Error',
          message: `Failed to run ${name}`,
          detail: err.toString(),
          cancelId: 1
        }, response => {
          if (response === 0) {
            window.location.reload()
          }
        })
      }
      ipc.once('reload', e => {
        window.localStorage.__load = JSON.stringify({ path: file.path })
        window.location.reload()
      })
    }

    window.addEventListener('dragover', e => {
      if (mainMenu !== null && canDrop) {
        e.preventDefault()
        mainMenu.dropZone.dropState.defaultValue = 1

        let files = e.dataTransfer.files
        mainMenu.dropZone.tooManyFiles.defaultValue = files.length > 1
        if (files.length === 1) {
          let file = files[0]
          let filePath = path.parse(file.path)
          mainMenu.dropZone.wrongType.defaultValue = filePath.ext &&
            filePath.ext !== '.js'
        }
      }
    })
    window.addEventListener('dragleave', stopDrag)
    window.addEventListener('dragend', stopDrag)
    window.addEventListener('drop', e => {
      if (mainMenu !== null && canDrop) {
        e.preventDefault()
        stopDrag(e)
        let file = e.dataTransfer.files[0]
        canDrop = false
        mainMenu.dropZone.dropState.defaultValue = 2
        setTimeout(() => {
          mainMenu.timeline.duration = 4
          mainMenu.timeline.play()
          mainMenu.timeline.once('end', () => {
            mainMenu.timeline.stop()
            mainMenu = null
            run(file)
          })
        }, 100)
      }
    })

    if (window.localStorage.__load) {
      mainMenu.timeline.stop()
      mainMenu = null
      canDrop = false
      run(JSON.parse(window.localStorage.__load))
      delete window.localStorage.__load
    }
  }
}
