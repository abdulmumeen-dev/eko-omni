// desktop/main.js
const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

let tray = null;
let mainWindow = null;

// Create the main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.png'),
        title: '🧠 EKO Desktop'
    });

    // Load the dashboard
    mainWindow.loadFile(path.join(__dirname, 'dashboard', 'index.html'));

    // Open DevTools (optional)
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Create system tray
function createTray() {
    tray = new Tray(path.join(__dirname, 'icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { 
            label: '🧠 Open EKO', 
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                } else {
                    createWindow();
                }
            }
        },
        { type: 'separator' },
        { 
            label: '🔄 Restart EKO', 
            click: () => {
                if (mainWindow) {
                    mainWindow.reload();
                }
            }
        },
        { 
            label: '📊 View Dashboard',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        { type: 'separator' },
        { 
            label: '🚪 Quit', 
            click: () => {
                app.quit();
            }
        }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip('🧠 EKO - Digital Organism');

    // Click tray to open
    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        } else {
            createWindow();
        }
    });
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();
    createTray();

    // On macOS, keep app alive
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Keep app running in tray (don't quit)
    // Only quit if user clicks "Quit" from tray
});

app.on('before-quit', () => {
    // Cleanup logic
    console.log('[Desktop] EKO shutting down...');
});
