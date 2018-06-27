const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
//const ipc = electron.ipcMain

const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null

if (process.env.NODE_ENV == 'development') {
  const doWatch = () => {
    const fs = require('fs')
    //const childProcess = require('child_process')

    fs.watch(__dirname, {recursive: true}, (event, filename) => {
      const a = filename.split('.')
      switch (a[a.length - 1]) {
        case 'html':
          mainWindow.loadURL('file://' + __dirname + '/' + filename)
          break
        case 'js':
          mainWindow.reload()
          /*childProcess.exec(
            `eslint ${__dirname}\\${filename}`, (err) => {
              if (!err) {
                mainWindow.reload()
              }
            }
          )*/
          break
        case 'md':
        case 'css':
        case 'yml':
          mainWindow.reload()
          break
      }
    })
  }
  doWatch()
}

/*
// updater sample
//const version = conf['version']
const conf = require('../config.json')
function findUpdater (ver) {
  let installer_name = conf['installer']
  let glob_name = installer_name.replace(/\{version\}/, '*')
  let re = new RegExp(installer_name.replace(/\{version\}/, '(\\d+\.\\d+\.\\d+)'))

  const glob = require('glob')
  let files = glob.sync(glob_name, {cwd:conf['installer_path']})
  let latest  = null
  let latest_ver  = null
  for (let file of files) {
    let m = file.match(re)
    if (!m || m.length != 2)
      continue
    if (latest && m[1] < latest_ver)
      continue
    latest_ver = m[1]
    latest = file
  }
  if (latest && latest_ver > ver)
    return path.resolve(conf['installer_path'], latest)
  return null
}

function updateApp (updater) {
  if (updater === undefined)
    updater = findUpdater(version)
  if (!updater)
    return
  
  const childProcess = require('child_process')
  childProcess.spawn(updater, [], {
    detached: true
  })
  app.quit()
}

let noUpdate = false

function checkUpdate () {
  if (noUpdate)
    return
  let updater = findUpdater(version)
  if (!updater)
    return
  if (electron.dialog.showMessageBox({
    type: 'question',
    title: 'scene_exporter自動更新',
    message: '最新版があります。更新してよろしいですか？',
    buttons: ['更新', 'あとで']
  })) {
    noUpdate = true
    return
  }
  updateApp(updater)
}
*/

/*function alert (msg)
{
  electron.dialog.showMessageBox({message: msg})
}*/

/*
// ipc sample
function openDialog ()
{
  let options = {
      title: 'タイトル',
      filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'JPEG File', extensions: ['jpg', 'jpeg']},
      ],
      properties: ['openFile', 'createDirectory']
  }

  electron.dialog.showOpenDialog(mainWindow, options, (r) => {
    if (r && r[0])
      alert(r[0])
    else
      alert('キャンセル？')
  })
}

ipc.on('pong', (e, msg) => {
  electron.dialog.showMessageBox({message: 'pong:' + msg})
  setTimeout(() => {
    e.returnValue = 'pong!'
  }, 100)
})

ipc.on('openDialog', (e) => {
  let options = {
      title: 'タイトル',
      filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'JPEG File', extensions: ['jpg', 'jpeg']},
      ],
      properties: ['openFile', 'createDirectory']
  }
  electron.dialog.showOpenDialog(mainWindow, options, (r) => {
    e.returnValue = r || []
  })
})
*/

let contents = [
  'index.html',
]

let menu = Menu.buildFromTemplate([
  {
    label: 'File',
    submenu: [
      {
        label: 'シーンを開く',
        click () {
          mainWindow.webContents.send('loadScene')
        }
      },
      {
        label: 'ファイルを開く',
        click () {
          mainWindow.webContents.send('loadFile')
        }
      },
      {type: 'separator'},
      {
        label: '戻る',
        click () {
          mainWindow.webContents.goBack()
        }
      },
      {
        label: '進む',
        click () {
          mainWindow.webContents.goForward()
        }
      },
      {type: 'separator'},
      {role: 'reload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'close'},
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'undo', 
        accelerator: 'Ctrl+Z',
        click () { mainWindow.webContents.send('undo') }
      },
      {
        label: 'redo', 
        accelerator: 'Ctrl+Y',
        click () { mainWindow.webContents.send('redo') }
      },
      {type: 'separator'},
      {
        label: 'undo clear', 
        click () { mainWindow.webContents.send('undoClear') }
      },
    ]
  },
  {
    label: 'Mode',
    submenu: contents.map(e => {
      return {label: e, click: () => navigate(e)}
    }),
  },
  {
    label: 'Test',
    submenu: [
      {label: 'ping', click: () => {
        mainWindow.webContents.send('ping', 'こんにちはメインです') 
      }},
      //{label: 'openDialog', click: openDialog},
    ]
  },
])

Menu.setApplicationMenu(menu)

function navigate (page) {
  mainWindow.loadURL('file://' + __dirname + '/' + page)
}  

function createWindow () {
  electron.globalShortcut.register('Ctrl+Z', () => {
    mainWindow.webContents.send('undo')
  })

  electron.globalShortcut.register('Ctrl+Y', () => {
    mainWindow.webContents.send('redo')
  })

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  /*
	// update sample
	if (process.env.NODE_ENV != 'development') {
    checkUpdate()
    setInterval(checkUpdate, 1000*60)
  }*/

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, contents[0]),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

