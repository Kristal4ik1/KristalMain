
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 500,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
        color: '#1E1F22',
        symbolColor: '#ffffff',
        height: 30
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDev // Only enable devtools in dev mode by default
    },
    backgroundColor: '#313338',
    // Ensure icon exists or handle error gracefully
    icon: path.join(__dirname, 'assets/icon.ico') 
  });

  if (isDev) {
    // In development, load the dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the index.html from the dist folder
    // Navigate up from 'electron' folder to root, then 'dist'
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
  
  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http:') || url.startsWith('https:')) {
          shell.openExternal(url);
          return { action: 'deny' };
      }
      return { action: 'allow' };
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for Desktop Integration
ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('app:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.minimize();
});
ipcMain.handle('app:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win?.isMaximized()) win.unmaximize();
    else win?.maximize();
});
ipcMain.handle('app:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win?.close();
});
