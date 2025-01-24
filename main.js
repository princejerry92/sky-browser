const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');

let splash;
let mainWindow;

function createSplashScreen() {
    splash = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        resizable: true,
        webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false
        }
    });
    splash.loadFile(path.join(__dirname, 'src', 'splash.html'));
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,  // Main window is hidden initially
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
            webviewTag: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

    const splashDelay = 5000;  // Adjust as needed

    setTimeout(() => {
        if (mainWindow) {
            mainWindow.show();
            if (splash) {
                splash.close();
                splash = null;
            }
        }
    }, splashDelay);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Handle HTTP requests from renderer via ipcMain
ipcMain.on('httpRequest', async (event, { url }) => {
    try {
        const response = await axios.get(url);
        event.reply('httpResponse', response.data);
    } catch (error) {
        event.reply('httpResponse', { error: error.message });
    }
});


// App lifecycle events
app.whenReady().then(() => {
    createSplashScreen();
    createMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createSplashScreen();
        createMainWindow();
    }
});
