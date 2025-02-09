import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: typeof electronAPI;
    api: {
      ditchWindow: () => void;
      onScreenCropStartV2: (
        handler: (cb: (rect: { x: number; y: number; width: number; height: number }) => void) => void,
        onSuccess: () => void,
        onError: (err: string) => void
      ) => void;
    };
  }
}

function cropScreen(rect: { x: number; y: number; width: number; height: number }) {
  console.log('cropscreen');
  ipcRenderer.send('crop-screen', rect);
}

// Custom APIs for renderer
const api = {
  ditchWindow: () => {
    ipcRenderer.send('ditchwindow');
    console.debug('ipcRenderer: ditchwindow event sent.');
  },
  onScreenCropStartV2: (
    handler: (cb: (rect: { x: number; y: number; width: number; height: number }) => void) => void,
    onSuccess: () => void,
    onError: (err: string) => void
  ) => {
    console.debug('Listening for prep-screencrop event.');
    ipcRenderer.on('prep-screencrop', () => {
      console.debug('prep-screencrop event received.');
      ipcRenderer.once('oncropscreen:success', onSuccess);
      ipcRenderer.once('oncropscreen:error', (_, err) => onError(err));
      handler(cropScreen);
    });
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}