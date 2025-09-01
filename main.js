const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Recommended for security
            webviewTag: true, // Enable the <webview> tag
            contextIsolation: true,
            nodeIntegration: false,
        },
        backgroundColor: '#111827', // Match your bg-gray-900
    });

    // --- THE FIX ---
    // Listen for the window itself trying to enter fullscreen and prevent it.
    // This stops the default OS-level fullscreen behavior.
    mainWindow.on('enter-full-screen', (event) => {
        console.log('Main process caught window entering fullscreen. Preventing it.');
        event.preventDefault();
    });

    // and load the index.html of the app.
    mainWindow.loadFile('index.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    // --- SOLUTION FOR X-FRAME-OPTIONS ---
    // Intercept all network responses before they are sent to the renderer.
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        const responseHeaders = { ...details.responseHeaders };

        // Delete the 'x-frame-options' header if it exists.
        // This allows rendering sites like Google in a webview/iframe.
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