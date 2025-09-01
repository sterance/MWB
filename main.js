const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true,
            contextIsolation: true,
            nodeIntegration: false,
        },
        backgroundColor: '#111827',
    });

    mainWindow.on('enter-full-screen', (event) => {
        console.log('Main process caught window entering fullscreen. Preventing it.');
        event.preventDefault();
    });

    mainWindow.webContents.on('enter-html-full-screen', (event) => {
        console.log('Preventing HTML fullscreen in main window');
        event.preventDefault();
    });

    mainWindow.webContents.on('leave-html-full-screen', (event) => {
        console.log('Preventing HTML fullscreen exit in main window');
        event.preventDefault();
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    // Intercept all network responses before they are sent to the renderer.
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = { ...details.responseHeaders };

        // Delete the 'x-frame-options' header if it exists.
        Object.keys(responseHeaders).forEach(header => {
            if (header.toLowerCase() === 'x-frame-options') {
                delete responseHeaders[header];
            }
        });

        callback({ responseHeaders });
    });

    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});