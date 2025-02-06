import { app, shell, BrowserWindow, ipcMain, screen, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import { captureScreen } from './captureScreen'
import { healthcheck, ocrImageToText } from './ocrImageToText'

function createMainWindow({ width, height }): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const screenSize: Electron.Size = primaryDisplay.workAreaSize
  const scaleFactor = primaryDisplay.scaleFactor
  // Set app user model id for windows
  electronApp.setAppUserModelId('io.radiohack')

  // ESC hotkey
  globalShortcut.register('Escape', () => {
    app.quit()
  })
  
  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // IPC crop-screen
  ipcMain.on(
    'crop-screen',
    async (event, rect: { x: number; y: number; width: number; height: number }) => {
      console.log('crop-screen!!', rect)
      const outputDir = app.getPath('pictures')
      const outputPath = join(outputDir, 'cropped.png')
      const res = await healthcheck()
      console.log(await res.json())
      captureScreen(rect, scaleFactor, outputPath)
        .then(({msg, imgPath}) => {
          console.log(msg)
          ocrImageToText(imgPath).then((result) => {
            console.log('OCR result=', result)
            event.sender.send('crop-screen:success', result)
          }).catch((err) => {
            console.error(err)
            event.sender.send('crop-screen:error', err)
          })
        })
        .catch((err) => {
          console.error(err)
          event.sender.send('crop-screen:error', err)
        })

      // screenshot()
      //   .then((imgBuffer) => {
      //     const img = nativeImage.createFromBuffer(imgBuffer, { scaleFactor })
      //     const croppedImg = img.crop(rect)

      //     const outputDir = app.getPath('pictures')
      //     const outputPath = join(outputDir, 'cropped.png')

      //     try {
      //       fs.writeFileSync(outputPath, croppedImg.toPNG())
      //       console.log(`Cropped image save to ${outputPath}`)
      //     } catch (err) {
      //       console.error('Failed to save cropped image:', err)
      //       event.sender.send('crop-screen:error', 'Failed to save the image.')
      //     }
      //   })
      //   .catch((err) => {
      //     console.error('Failed to capture screenshot:', err)
      //     event.sender.send('crop-screen:error', 'Failed to capture the screen.')
      //   })
    }
  )
  createMainWindow(screenSize)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow(screenSize)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
// const ocrImageToText = () => {
//   const buffer = fs.readFileSync('')
// }
