const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("qamarAPI", {
  appName: "QamarOS",
  minimizeApp: () => ipcRenderer.send("app:minimize"),
  maximizeToggleApp: () => ipcRenderer.send("app:maximize-toggle"),
  closeApp: () => ipcRenderer.send("app:close")
});