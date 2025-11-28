const { app, BrowserWindow, ipcMain, shell, nativeTheme } = require('electron');
const path = require('path');
const os = require('os');
const vm = require('vm');

const isDev = !!process.env.ELECTRON_START_URL;
const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';

app.setAppUserModelId('com.meacode.editor');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('enable-features', 'CanvasOopRasterization,Accelerated2dCanvas');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

let mainWindow;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#111111' : '#ffffff',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: false
    }
  });

  win.once('ready-to-show', () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadURL(startUrl);

  win.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      if (!win.isDestroyed()) win.loadURL(startUrl);
    }, 1000);
  });

  mainWindow = win;
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('app:getInfo', () => {
  return {
    platform: process.platform,
    versions: process.versions,
    isDev,
    cpus: os.cpus()?.length || 0,
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    arch: process.arch
  };
});

ipcMain.handle('app:runJS', async (_event, code) => {
  const logs = [];
  const push = (type) => (...args) => logs.push({ type, content: args });
  const sandbox = {
    console: {
      log: push('log'),
      error: push('error'),
      warn: push('warn'),
      info: push('info'),
    },
  };
  try {
    const context = vm.createContext(sandbox);
    const script = new vm.Script(String(code || ''), { filename: 'user.js' });
    script.runInContext(context, { timeout: 1500 });
  } catch (e) {
    logs.push({ type: 'error', content: [e && e.message ? e.message : String(e)] });
  }
  return { logs };
});
