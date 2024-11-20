import {BrowserWindow, globalShortcut} from "electron";
import path from "path";

let mainWindow: Electron.BrowserWindow | null;

const createWindow = async (rootPath: string, kioskWidth: number, kioskHeight: number) => {
    mainWindow = new BrowserWindow({
        width: kioskWidth,
        height: kioskHeight,
        alwaysOnTop: true,
        webPreferences: {
            webviewTag: true,
            nodeIntegration: true,
            backgroundThrottling: false,
            contextIsolation: false,
            preload: path.join(rootPath, 'preload.js')
        }
    });
    await mainWindow.loadFile(path.join(rootPath, "../views/index.html"));
    await mainWindow.webContents.openDevTools();
    return mainWindow;
};

const toggleDevTools = () => {
    const winFirst = BrowserWindow.getAllWindows()[0];
    if (!winFirst) {
        return;
    }
    const isDevToolsOpened = winFirst.webContents.isDevToolsOpened();
    const isDevToolsFocused = winFirst.webContents.isDevToolsFocused();

    if (isDevToolsOpened && isDevToolsFocused) {
        winFirst.webContents.closeDevTools();
    } else if (isDevToolsOpened && !isDevToolsFocused) {
        winFirst.webContents.devToolsWebContents?.focus();
    } else {
        winFirst.webContents.openDevTools();
    }
};

// 새로고침 함수 (화살표 함수 사용)
const reloadWindow = () => {
    const winFirst = BrowserWindow.getAllWindows()[0];
    if (!winFirst) {
        return;
    }
    winFirst.reload();
};

// 단축키 등록 함수 (화살표 함수 사용)
const registerShortcuts = async () => {
    globalShortcut.register("CommandOrControl+Shift+d", toggleDevTools);
    globalShortcut.register("CommandOrControl+Shift+r", reloadWindow);
};
export {createWindow, registerShortcuts};
