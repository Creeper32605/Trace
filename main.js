const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
const url = require('url')

const menu = require('./js/menu')

let createWindow = function () {
  let options = {
    width: 800,
    height: 600,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      blinkFeatures: 'CustomElementsV1'
    }
  }

  if (process.platform === 'darwin') {
    options.titleBarStyle = 'hidden'
    options.vibrancy = 'dark'
  } else {
    options.autoHideMenuBar = true
    options.backgroundColor = '#000000'
  }

  let window = new BrowserWindow(options)

  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  window.once('ready-to-show', () => {
    window.show()
  })

  window.on('blur', () => {
    window.webContents.send('blur')
  })

  window.on('focus', () => {
    window.webContents.send('focus')
  })

  window.on('enter-full-screen', () => {
    window.webContents.send('fullscreen', true)
  })

  window.on('leave-full-screen', () => {
    window.webContents.send('fullscreen', false)
  })

  window.webContents.on('new-window', e => e.preventDefault())
  window.webContents.on('will-navigate', e => e.preventDefault())

  window.webContents.on('crashed', () => {
    dialog.showMessageBox(window, {
      type: 'error',
      buttons: ['Close', 'OK'],
      defaultId: 0,
      title: 'Error',
      message: 'The renderer crashed!',
      cancelId: 1
    }, response => {
      if (response === 0) {
        process.nextTick(() => {
          window.close()
        })
      }
    })
  })
}

app.on('ready', () => {
  menu.init()
  createWindow()
})

app.on('window-all-closed', () => {
  app.quit()
})
