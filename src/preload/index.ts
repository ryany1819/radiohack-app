import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  cropScreen: (rect: { x: number; y: number; width: number; height: number }) => {
    console.log('cropscreen')
    ipcRenderer.send('crop-screen', rect)
  },
  onCropScreenSuccess: (callback: () => void) => {
    console.log('oncropscreensuccess bound')
    ipcRenderer.on('crop-screen:success', (_, rect) => {
      console.log('rect=', rect)
      callback()
    })
    ipcRenderer.on('crop-screen:error', (_, err) => {
      console.error('Error:', err)
      alert(err)
    })
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
