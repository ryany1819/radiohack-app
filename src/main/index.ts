import { app, shell, BrowserWindow, ipcMain, screen, globalShortcut, clipboard } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import { captureScreen } from './captureScreen'
import { ocrImageToText } from './ocrImageToText'

function createMainWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  if (!mainWindow.isMaximized()) mainWindow.maximize()
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

  return mainWindow
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('io.radiohack')

  const primaryDisplay = screen.getPrimaryDisplay()
  // const screenSize: Electron.Size = primaryDisplay.workAreaSize
  const scaleFactor = primaryDisplay.scaleFactor
  const mainWindow = createMainWindow()

  // ESC hotkey
  globalShortcut.register('Escape', () => {
    console.debug('ESC detected.')
    app.quit()
  })

  // Alt + R hotkey
  globalShortcut.register('Alt+R', () => {
    console.debug('Alt + R detected.');
    if (!mainWindow) {
      console.error('Main window is not available.');
      return;
    }
    console.debug('Sending prep-screencrop event to renderer.');
    mainWindow.webContents.send('prep-screencrop');
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
      captureScreen(rect, scaleFactor, outputPath)
        .then(({ msg, imgPath }) => {
          console.log(msg)
          ocrImageToText(imgPath)
            .then((result) => {
              console.log('OCR result=', result)
              clipboard.writeText(result.extracted_text)
              event.sender.send('oncropscreen:success', result)
            })
            .catch((err) => {
              console.error(err)
              event.sender.send('oncropscreen:error', err)
            })
        })
        .catch((err) => {
          console.error(err)
          event.sender.send('oncropscreen:error', err)
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

  ipcMain.on('ditchwindow', () => {
    console.debug('ditchwindow event.')
    //mainWindow.blur()
  })

  ipcMain.on('closewindow', () => {
    console.debug('closewindow event.')
    mainWindow.close()
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
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
