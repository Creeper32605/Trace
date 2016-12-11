const {app, Menu} = require('electron')

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O'
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'Control',
    submenu: [
      {
        label: 'Run/Stop',
        accelerator: 'CmdOrCtrl+R',
        click (menuItem, browserWindow, event) {
          if (browserWindow) browserWindow.send('runstop')
        }
      },
      {
        label: 'Play/Pause',
        accelerator: 'CmdOrCtrl+Return',
        click (menuItem, browserWindow, event) {
          if (browserWindow) browserWindow.send('playpause')
        }
      },
      { type: 'separator' },
      {
        label: 'Previous Stop',
        accelerator: 'CmdOrCtrl+Left',
        click (menuItem, browserWindow, event) {
          if (browserWindow) browserWindow.send('prevstop')
        }
      },
      {
        label: 'Next Stop',
        accelerator: 'CmdOrCtrl+Right',
        click (menuItem, browserWindow, event) {
          if (browserWindow) browserWindow.send('nextstop')
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload', accelerator: 'Shift+CmdOrCtrl+R' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        enabled: false
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        role: 'about'
      },
      { type: 'separator' },
      {
        role: 'services',
        submenu: []
      },
      { type: 'separator' },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      { type: 'separator' },
      {
        role: 'quit'
      }
    ]
  })
  template[2].submenu.push(
    { type: 'separator' },
    {
      label: 'Speech',
      submenu: [
        {
          role: 'startspeaking'
        },
        {
          role: 'stopspeaking'
        }
      ]
    }
  )
  template[5].submenu = [
    {
      role: 'close'
    },
    {
      role: 'minimize'
    },
    {
      role: 'zoom'
    },
    { type: 'separator' },
    {
      role: 'front'
    }
  ]
}

let menu
module.exports = {
  init: function () {
    menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
  }
}
