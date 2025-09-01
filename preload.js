const { contextBridge, ipcRenderer } = require('electron');

// Expose APIs to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // Method for webviews to notify about fullscreen changes
    notifyFullscreen: (isFullscreen) => {
        // This can be used to communicate fullscreen state changes
        // between webview content and the main renderer
        console.log('Fullscreen state changed:', isFullscreen);
        
        // You can extend this to send IPC messages if needed
        // ipcRenderer.send('fullscreen-change', isFullscreen);
    },
    
    // Method to send messages to webview
    sendToWebview: (message) => {
        return ipcRenderer.invoke('send-to-webview', message);
    }
});

// Initialize fullscreen handling when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    console.log('Preload script loaded - fullscreen hijacking ready');
});