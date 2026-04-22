const bootAudio = document.getElementById("boot-audio");
const bootScreen = document.getElementById("boot-screen");
const authScreen = document.getElementById("auth-screen");
const desktopScreen = document.getElementById("desktop-screen");
const loadingProgress = document.getElementById("loading-progress");

const setupCard = document.getElementById("setup-card");
const loginCard = document.getElementById("login-card");
const setupUsername = document.getElementById("setup-username");
const setupPassword = document.getElementById("setup-password");
const setupBtn = document.getElementById("setup-btn");
const loginUsername = document.getElementById("login-username");
const loginPassword = document.getElementById("login-password");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");

const clock = document.getElementById("clock");
const windowLayer = document.getElementById("window-layer");
const startButton = document.getElementById("start-button");
const startMenu = document.getElementById("start-menu");
const searchInput = document.getElementById("global-search");
const desktopIcons = document.getElementById("desktop-icons");
const taskbarApps = document.getElementById("taskbar-apps");

const sysMinimize = document.getElementById("sys-minimize");
const sysMaximize = document.getElementById("sys-maximize");
const sysClose = document.getElementById("sys-close");
const contextMenu = document.getElementById("context-menu");

let zIndexCounter = 20;
let appWindows = {};
let activeWindow = null;

const THEMES = ["theme-blue", "theme-purple", "theme-green"];
const WALLPAPERS = ["wallpaper-1", "wallpaper-2", "wallpaper-3", "wallpaper-4"];

const APP_META = {
  terminal: { title: "Terminal" },
  browser: { title: "Browser" },
  notes: { title: "Notes" },
  calculator: { title: "Calculator" },
  files: { title: "Files" },
  trash: { title: "Recycle Bin" },
  settings: { title: "Settings" },
  guide: { title: "Guide" },
  about: { title: "About" }
};

let trashItems = JSON.parse(localStorage.getItem("qamar_trash") || "[]");
if (!trashItems.length) {
  trashItems = [
    { name: "old-note.txt", info: "Deleted note example" },
    { name: "draft-readme.md", info: "Old documentation draft" }
  ];
  localStorage.setItem("qamar_trash", JSON.stringify(trashItems));
}

/* ---------------- Boot ---------------- */
let bootSoundPlayed = false;
let progress = 0;

const bootInterval = setInterval(() => {
  if (!bootSoundPlayed && bootAudio) {
    bootAudio.volume = 0.6;
    bootAudio.play().catch(() => {});
    bootSoundPlayed = true;
  }

  progress += Math.random() * 13;

  if (progress >= 100) {
    progress = 100;
    clearInterval(bootInterval);

    setTimeout(() => {
      bootScreen.classList.remove("active");
      authScreen.classList.add("active");
      initAuth();
    }, 380);
  }

  loadingProgress.style.width = `${progress}%`;
}, 170);

/* ---------------- Auth ---------------- */
function initAuth() {
  const savedUser = localStorage.getItem("qamar_user");
  const savedPass = localStorage.getItem("qamar_pass");

  if (!savedUser || !savedPass) {
    setupCard.classList.remove("hidden");
    loginCard.classList.add("hidden");
  } else {
    setupCard.classList.add("hidden");
    loginCard.classList.remove("hidden");
    loginUsername.value = savedUser;
  }
}

setupBtn.addEventListener("click", () => {
  const username = setupUsername.value.trim();
  const password = setupPassword.value.trim();

  if (!username || !password) return;

  localStorage.setItem("qamar_user", username);
  localStorage.setItem("qamar_pass", password);

  setupCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
  loginUsername.value = username;
  loginPassword.value = "";
});

loginBtn.addEventListener("click", () => {
  const savedUser = localStorage.getItem("qamar_user");
  const savedPass = localStorage.getItem("qamar_pass");

  if (loginUsername.value.trim() === savedUser && loginPassword.value === savedPass) {
    loginError.textContent = "";
    authScreen.classList.remove("active");
    desktopScreen.classList.add("active");
  } else {
    loginError.textContent = "Wrong username or password.";
  }
});

/* ---------------- App Window Controls ---------------- */
sysMinimize.addEventListener("click", () => window.qamarAPI.minimizeApp());
sysMaximize.addEventListener("click", () => window.qamarAPI.maximizeToggleApp());
sysClose.addEventListener("click", () => window.qamarAPI.closeApp());

/* ---------------- Clock ---------------- */
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  clock.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ---------------- Search ---------------- */
searchInput.addEventListener("input", () => {
  const value = searchInput.value.toLowerCase().trim();
  const icons = desktopIcons.querySelectorAll(".desktop-icon");

  icons.forEach((icon) => {
    const label = icon.innerText.toLowerCase();
    icon.style.display = label.includes(value) ? "" : "none";
  });
});

/* ---------------- Menus ---------------- */
startButton.addEventListener("click", (e) => {
  e.stopPropagation();
  startMenu.classList.toggle("hidden");
  hideContextMenu();
});

document.addEventListener("click", () => {
  startMenu.classList.add("hidden");
  hideContextMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    startMenu.classList.add("hidden");
    hideContextMenu();
  }
});

/* ---------------- Context Menu ---------------- */
desktopScreen.addEventListener("contextmenu", (e) => {
  const clickedInsideWindow = e.target.closest(".window");
  const clickedTaskbar = e.target.closest(".taskbar");
  const clickedTopbar = e.target.closest(".topbar");

  if (clickedInsideWindow || clickedTaskbar || clickedTopbar) return;

  e.preventDefault();
  startMenu.classList.add("hidden");

  contextMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 240)}px`;
  contextMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 320)}px`;
  contextMenu.classList.remove("hidden");
});

function hideContextMenu() {
  contextMenu.classList.add("hidden");
}

contextMenu.addEventListener("click", (e) => {
  e.stopPropagation();
});

contextMenu.querySelectorAll(".context-item").forEach((item) => {
  item.addEventListener("click", () => {
    const action = item.dataset.action;
    const theme = item.dataset.theme;
    const wallpaper = item.dataset.wallpaper;

    if (action === "refresh") {
      desktopScreen.style.transform = "scale(0.998)";
      setTimeout(() => {
        desktopScreen.style.transform = "scale(1)";
      }, 100);
    }

    if (action === "open-settings") openApp("settings");
    if (action === "open-terminal") openApp("terminal");
    if (action === "open-guide") openApp("guide");
    if (action === "open-trash") openApp("trash");

    if (theme) setTheme(theme);
    if (wallpaper) setWallpaper(wallpaper);

    hideContextMenu();
  });
});

/* ---------------- Open apps ---------------- */
document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openApp(btn.getAttribute("data-open"));
    startMenu.classList.add("hidden");
  });
});

document.querySelectorAll(".desktop-icon").forEach((icon) => {
  icon.addEventListener("click", (e) => {
    e.stopPropagation();
    openApp(icon.getAttribute("data-app"));
  });
});

function openApp(appName) {
  if (appWindows[appName] && document.body.contains(appWindows[appName])) {
    restoreWindow(appWindows[appName]);
    return;
  }

  if (appName === "terminal") appWindows[appName] = createTerminalWindow();
  if (appName === "notes") appWindows[appName] = createNotesWindow();
  if (appName === "browser") appWindows[appName] = createBrowserWindow();
  if (appName === "calculator") appWindows[appName] = createCalculatorWindow();
  if (appName === "files") appWindows[appName] = createFilesWindow();
  if (appName === "trash") appWindows[appName] = createTrashWindow();
  if (appName === "settings") appWindows[appName] = createSettingsWindow();
  if (appName === "guide") appWindows[appName] = createGuideWindow();
  if (appName === "about") appWindows[appName] = createAboutWindow();

  if (appWindows[appName]) syncTaskbar();
}

/* ---------------- Window Manager ---------------- */
function createWindow(title, appId, contentHTML, width = 700, height = 460) {
  const win = document.createElement("section");
  win.className = "window";
  win.dataset.app = appId;
  win.dataset.minimized = "false";
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.left = `${Math.floor(Math.random() * 180 + 160)}px`;
  win.style.top = `${Math.floor(Math.random() * 100 + 110)}px`;
  win.style.zIndex = zIndexCounter++;

  win.innerHTML = `
    <div class="window-header">
      <div class="window-title">${title}</div>
      <div class="window-actions">
        <div class="window-btn min-btn" title="Minimize">—</div>
        <div class="window-btn max-btn" title="Maximize">□</div>
        <div class="window-btn close-btn" title="Close">✕</div>
      </div>
    </div>
    <div class="window-content">${contentHTML}</div>
  `;

  windowLayer.appendChild(win);
  focusWindow(win);
  makeDraggable(win);

  const minBtn = win.querySelector(".min-btn");
  const maxBtn = win.querySelector(".max-btn");
  const closeBtn = win.querySelector(".close-btn");

  minBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    minimizeWindow(win);
  });

  maxBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    win.classList.toggle("maximized");
    focusWindow(win);
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeWindow(win);
  });

  win.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    focusWindow(win);
    hideContextMenu();
  });

  syncTaskbar();
  return win;
}

function focusWindow(win) {
  if (!win || !document.body.contains(win)) return;

  win.classList.remove("minimized");
  win.dataset.minimized = "false";
  win.style.zIndex = zIndexCounter++;
  activeWindow = win;
  syncTaskbar();
}

function minimizeWindow(win) {
  win.classList.add("minimized");
  win.dataset.minimized = "true";
  if (activeWindow === win) activeWindow = null;
  syncTaskbar();
}

function restoreWindow(win) {
  win.classList.remove("minimized");
  win.dataset.minimized = "false";
  focusWindow(win);
}

function closeWindow(win) {
  const appId = win.dataset.app;
  if (appWindows[appId] === win) delete appWindows[appId];
  if (activeWindow === win) activeWindow = null;
  win.remove();
  syncTaskbar();
}

function makeDraggable(win) {
  const header = win.querySelector(".window-header");
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  header.addEventListener("mousedown", (e) => {
    if (win.classList.contains("maximized")) return;
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

function syncTaskbar() {
  taskbarApps.innerHTML = "";

  Object.entries(appWindows).forEach(([appId, win]) => {
    if (!document.body.contains(win)) return;

    const btn = document.createElement("button");
    btn.className = "taskbar-app-btn";
    btn.textContent = APP_META[appId]?.title || appId;

    const isMinimized = win.dataset.minimized === "true";
    const isActive = activeWindow === win && !isMinimized;

    if (isMinimized) btn.classList.add("minimized");
    if (isActive) btn.classList.add("active");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      if (win.dataset.minimized === "true") {
        restoreWindow(win);
        return;
      }

      if (activeWindow === win) {
        minimizeWindow(win);
        return;
      }

      focusWindow(win);
    });

    taskbarApps.appendChild(btn);
  });
}

/* ---------------- Theme + Wallpaper ---------------- */
function setTheme(themeClass) {
  THEMES.forEach((theme) => desktopScreen.classList.remove(theme));
  desktopScreen.classList.add(themeClass);
  localStorage.setItem("qamar_theme", themeClass);
}

function setWallpaper(wallpaperClass) {
  WALLPAPERS.forEach((wallpaper) => desktopScreen.classList.remove(wallpaper));
  desktopScreen.classList.add(wallpaperClass);
  localStorage.setItem("qamar_wallpaper", wallpaperClass);
}

/* ---------------- Terminal ---------------- */
function createTerminalWindow() {
  const html = `
    <div class="terminal-shell">
      <div class="terminal-toolbar">QamarOS Terminal</div>
      <div class="terminal-output" id="terminal-output">
QamarOS Terminal v5.0
Made by Byteforge0 (Yazen Alsaho)

Type "help" to see commands.
      </div>
      <div class="terminal-input-row">
        <span class="terminal-prompt">user@qamar:~$</span>
        <input class="terminal-input" id="terminal-input" type="text" autocomplete="off" />
      </div>
    </div>
  `;

  const win = createWindow("Terminal", "terminal", html, 760, 500);
  const output = win.querySelector("#terminal-output");
  const input = win.querySelector("#terminal-input");

  input.focus();

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const cmd = input.value.trim();
    handleTerminalCommand(cmd, output);
    input.value = "";
  });

  return win;
}

function handleTerminalCommand(cmd, output) {
  let response = "";

  switch (cmd.toLowerCase()) {
    case "help":
      response = `Commands:
help
about
date
whoami
apps
open guide
open settings
open trash
theme blue
theme purple
theme green
wallpaper 1
wallpaper 2
wallpaper 3
wallpaper 4
clear`;
      break;
    case "about":
      response = `QamarOS v5.0
Made by Byteforge0 (Yazen Alsaho)
Byteforge0 and Yazen Alsaho are the same person.`;
      break;
    case "date":
      response = new Date().toString();
      break;
    case "whoami":
      response = `${localStorage.getItem("qamar_user") || "user"} | Creator: Byteforge0 (Yazen Alsaho)`;
      break;
    case "apps":
      response = "Installed apps: Terminal, Browser, Notes, Calculator, Files, Recycle Bin, Settings, Guide, About";
      break;
    case "open guide":
      openApp("guide");
      response = "Guide opened.";
      break;
    case "open settings":
      openApp("settings");
      response = "Settings opened.";
      break;
    case "open trash":
      openApp("trash");
      response = "Recycle Bin opened.";
      break;
    case "theme blue":
      setTheme("theme-blue");
      response = "Theme changed to blue.";
      break;
    case "theme purple":
      setTheme("theme-purple");
      response = "Theme changed to purple.";
      break;
    case "theme green":
      setTheme("theme-green");
      response = "Theme changed to green.";
      break;
    case "wallpaper 1":
      setWallpaper("wallpaper-1");
      response = "Wallpaper changed to Aurora Blue.";
      break;
    case "wallpaper 2":
      setWallpaper("wallpaper-2");
      response = "Wallpaper changed to Purple Night.";
      break;
    case "wallpaper 3":
      setWallpaper("wallpaper-3");
      response = "Wallpaper changed to Emerald Mist.";
      break;
    case "wallpaper 4":
      setWallpaper("wallpaper-4");
      response = "Wallpaper changed to Crimson Space.";
      break;
    case "clear":
      output.textContent = "";
      return;
    default:
      response = cmd ? `Command not found: ${cmd}` : "";
  }

  output.textContent += `\n\nuser@qamar:~$ ${cmd}\n${response}`;
  output.scrollTop = output.scrollHeight;
}

/* ---------------- Notes ---------------- */
function createNotesWindow() {
  const saved = localStorage.getItem("qamar_notes") || "";
  const html = `
    <div class="notes-layout">
      <div class="notes-bar">
        <button id="notes-save-btn">Save</button>
        <button id="notes-clear-btn">Clear</button>
      </div>
      <textarea class="notes-textarea" id="notes-area" placeholder="Write your ideas here...">${saved}</textarea>
    </div>
  `;

  const win = createWindow("Notes", "notes", html, 700, 500);
  const textarea = win.querySelector("#notes-area");
  const saveBtn = win.querySelector("#notes-save-btn");
  const clearBtn = win.querySelector("#notes-clear-btn");

  saveBtn.addEventListener("click", () => {
    localStorage.setItem("qamar_notes", textarea.value);
  });

  clearBtn.addEventListener("click", () => {
    if (textarea.value.trim()) {
      trashItems.push({ name: "notes_backup.txt", info: "Deleted notes snapshot" });
      localStorage.setItem("qamar_trash", JSON.stringify(trashItems));
    }
    textarea.value = "";
    localStorage.setItem("qamar_notes", "");
  });

  textarea.addEventListener("input", () => {
    localStorage.setItem("qamar_notes", textarea.value);
  });

  return win;
}

/* ---------------- Browser ---------------- */
function createBrowserWindow() {
  const html = `
    <div class="browser-layout">
      <div class="browser-toolbar">
        <button class="browser-btn" id="browser-back">←</button>
        <button class="browser-btn" id="browser-forward">→</button>
        <input class="browser-address" id="browser-address" value="https://example.com" />
        <button class="browser-go" id="browser-go">Go</button>
      </div>
      <div class="browser-view-wrap">
        <webview
          id="browser-view"
          class="browser-view"
          src="https://example.com"
          allowpopups
        ></webview>
      </div>
    </div>
  `;

  const win = createWindow("Browser", "browser", html, 980, 620);
  const webview = win.querySelector("#browser-view");
  const address = win.querySelector("#browser-address");
  const goBtn = win.querySelector("#browser-go");
  const backBtn = win.querySelector("#browser-back");
  const forwardBtn = win.querySelector("#browser-forward");

  function normalizeUrl(value) {
    const input = value.trim();
    if (!input) return "https://example.com";
    if (input.startsWith("http://") || input.startsWith("https://")) return input;
    if (input.includes(".") && !input.includes(" ")) return `https://${input}`;
    return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
  }

  function navigate() {
    const url = normalizeUrl(address.value);
    address.value = url;
    webview.src = url;
  }

  goBtn.addEventListener("click", navigate);
  address.addEventListener("keydown", (e) => {
    if (e.key === "Enter") navigate();
  });

  backBtn.addEventListener("click", () => {
    try { if (webview.canGoBack()) webview.goBack(); } catch {}
  });

  forwardBtn.addEventListener("click", () => {
    try { if (webview.canGoForward()) webview.goForward(); } catch {}
  });

  webview.addEventListener("did-navigate", (e) => {
    address.value = e.url;
  });

  return win;
}

/* ---------------- Calculator ---------------- */
function createCalculatorWindow() {
  const html = `
    <div class="calculator">
      <div class="calc-display" id="calc-display">0</div>
      <div class="calc-grid">
        <button class="calc-key" data-key="C">C</button>
        <button class="calc-key" data-key="(">(</button>
        <button class="calc-key" data-key=")">)</button>
        <button class="calc-key" data-key="/">÷</button>

        <button class="calc-key" data-key="7">7</button>
        <button class="calc-key" data-key="8">8</button>
        <button class="calc-key" data-key="9">9</button>
        <button class="calc-key" data-key="*">×</button>

        <button class="calc-key" data-key="4">4</button>
        <button class="calc-key" data-key="5">5</button>
        <button class="calc-key" data-key="6">6</button>
        <button class="calc-key" data-key="-">−</button>

        <button class="calc-key" data-key="1">1</button>
        <button class="calc-key" data-key="2">2</button>
        <button class="calc-key" data-key="3">3</button>
        <button class="calc-key" data-key="+">+</button>

        <button class="calc-key" data-key="0">0</button>
        <button class="calc-key" data-key=".">.</button>
        <button class="calc-key" data-key="DEL">⌫</button>
        <button class="calc-key" data-key="=">=</button>
      </div>
    </div>
  `;

  const win = createWindow("Calculator", "calculator", html, 430, 560);
  const display = win.querySelector("#calc-display");
  const keys = win.querySelectorAll(".calc-key");

  let expression = "";

  keys.forEach((key) => {
    key.addEventListener("click", () => {
      const value = key.dataset.key;

      if (value === "C") {
        expression = "";
        display.textContent = "0";
        return;
      }

      if (value === "DEL") {
        expression = expression.slice(0, -1);
        display.textContent = expression || "0";
        return;
      }

      if (value === "=") {
        try {
          const result = Function(`"use strict"; return (${expression})`)();
          expression = String(result);
          display.textContent = expression;
        } catch {
          display.textContent = "Error";
          expression = "";
        }
        return;
      }

      expression += value;
      display.textContent = expression;
    });
  });

  return win;
}

/* ---------------- Files ---------------- */
function createFilesWindow() {
  const html = `
    <div class="files-layout">
      <div class="files-sidebar">
        <h4>Folders</h4>
        <div class="folder-list">
          <div class="folder-item">Desktop<small>QamarOS shortcuts</small></div>
          <div class="folder-item">Documents<small>User documents</small></div>
          <div class="folder-item">Downloads<small>Saved files</small></div>
          <div class="folder-item">Projects<small>Development work</small></div>
        </div>
      </div>
      <div class="files-main">
        <h4>Recent Files</h4>
        <div class="file-list">
          <div class="file-item">readme.md<small>Project documentation</small></div>
          <div class="file-item">portfolio.txt<small>Created by Byteforge0 / Yazen Alsaho</small></div>
          <div class="file-item">terminal-log.txt<small>System log example</small></div>
          <div class="file-item">notes.qmr<small>QamarOS notes file</small></div>
        </div>
      </div>
    </div>
  `;

  return createWindow("Files", "files", html, 840, 520);
}

/* ---------------- Trash ---------------- */
function createTrashWindow() {
  const html = `
    <div class="trash-layout">
      <div class="trash-toolbar">
        <button id="trash-refresh-btn">Refresh</button>
        <button id="trash-empty-btn">Empty Bin</button>
      </div>
      <div class="trash-list" id="trash-list"></div>
    </div>
  `;

  const win = createWindow("Recycle Bin", "trash", html, 720, 520);
  const list = win.querySelector("#trash-list");
  const refreshBtn = win.querySelector("#trash-refresh-btn");
  const emptyBtn = win.querySelector("#trash-empty-btn");

  function renderTrash() {
    list.innerHTML = "";
    const current = JSON.parse(localStorage.getItem("qamar_trash") || "[]");

    if (!current.length) {
      list.innerHTML = `<div class="trash-item">Recycle Bin is empty.<small>No deleted items.</small></div>`;
      return;
    }

    current.forEach((item) => {
      const div = document.createElement("div");
      div.className = "trash-item";
      div.innerHTML = `${item.name}<small>${item.info}</small>`;
      list.appendChild(div);
    });
  }

  refreshBtn.addEventListener("click", renderTrash);

  emptyBtn.addEventListener("click", () => {
    trashItems = [];
    localStorage.setItem("qamar_trash", JSON.stringify(trashItems));
    renderTrash();
  });

  renderTrash();
  return win;
}

/* ---------------- Settings ---------------- */
function createSettingsWindow() {
  const currentTheme = localStorage.getItem("qamar_theme") || "theme-blue";
  const currentWallpaper = localStorage.getItem("qamar_wallpaper") || "wallpaper-1";
  const currentUser = localStorage.getItem("qamar_user") || "user";

  const html = `
    <div class="settings-layout">
      <div class="settings-sidebar">
        <div class="settings-nav">
          <button class="settings-nav-btn" data-section="general">General</button>
          <button class="settings-nav-btn" data-section="appearance">Appearance</button>
          <button class="settings-nav-btn" data-section="desktop">Desktop</button>
          <button class="settings-nav-btn" data-section="system">System</button>
        </div>
      </div>

      <div class="settings-main">
        <div class="settings-main-section active" data-settings-section="general">
          <div class="settings-grid">
            <div class="settings-card">
              <h4>User</h4>
              <p>Username: ${currentUser}</p>
              <p>Alias: Byteforge0</p>
              <p>Byteforge0 and Yazen Alsaho are the same person.</p>
            </div>

            <div class="settings-card">
              <h4>Quick Actions</h4>
              <div class="toggle-list">
                <button class="toggle-btn" data-quick="terminal">Open Terminal</button>
                <button class="toggle-btn" data-quick="browser">Open Browser</button>
                <button class="toggle-btn" data-quick="guide">Open Guide</button>
                <button class="toggle-btn" data-quick="trash">Open Recycle Bin</button>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-main-section" data-settings-section="appearance">
          <div class="settings-grid">
            <div class="settings-card">
              <h4>Theme</h4>
              <p>Current: ${currentTheme}</p>
              <div class="theme-options">
                <button class="theme-btn" data-theme="theme-blue">Blue</button>
                <button class="theme-btn" data-theme="theme-purple">Purple</button>
                <button class="theme-btn" data-theme="theme-green">Green</button>
              </div>
            </div>

            <div class="settings-card">
              <h4>Wallpaper</h4>
              <p>Current: ${currentWallpaper}</p>
              <div class="wallpaper-options">
                <button class="wallpaper-btn" data-wallpaper="wallpaper-1">Aurora</button>
                <button class="wallpaper-btn" data-wallpaper="wallpaper-2">Purple</button>
                <button class="wallpaper-btn" data-wallpaper="wallpaper-3">Emerald</button>
                <button class="wallpaper-btn" data-wallpaper="wallpaper-4">Crimson</button>
              </div>
            </div>
          </div>
        </div>

        <div class="settings-main-section" data-settings-section="desktop">
          <div class="settings-grid">
            <div class="settings-card">
              <h4>Wallpaper Preview 1</h4>
              <div class="wallpaper-preview preview-1"></div>
            </div>
            <div class="settings-card">
              <h4>Wallpaper Preview 2</h4>
              <div class="wallpaper-preview preview-2"></div>
            </div>
            <div class="settings-card">
              <h4>Wallpaper Preview 3</h4>
              <div class="wallpaper-preview preview-3"></div>
            </div>
            <div class="settings-card">
              <h4>Wallpaper Preview 4</h4>
              <div class="wallpaper-preview preview-4"></div>
            </div>
          </div>
        </div>

        <div class="settings-main-section" data-settings-section="system">
          <div class="settings-grid">
            <div class="settings-card">
              <h4>System Info</h4>
              <p>QamarOS v5.0</p>
              <p>Desktop Environment Online</p>
              <p>Window Manager Running</p>
            </div>

            <div class="settings-card">
              <h4>Credits</h4>
              <p>Made by Byteforge0 (Yazen Alsaho)</p>
              <p>Creator credit is always visible on the taskbar.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const win = createWindow("Settings", "settings", html, 980, 620);

  const navButtons = win.querySelectorAll(".settings-nav-btn");
  const sections = win.querySelectorAll(".settings-main-section");

  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.section;
      sections.forEach((section) => {
        section.classList.toggle("active", section.dataset.settingsSection === target);
      });
    });
  });

  win.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });

  win.querySelectorAll(".wallpaper-btn").forEach((btn) => {
    btn.addEventListener("click", () => setWallpaper(btn.dataset.wallpaper));
  });

  win.querySelectorAll("[data-quick]").forEach((btn) => {
    btn.addEventListener("click", () => openApp(btn.dataset.quick));
  });

  return win;
}

/* ---------------- Guide ---------------- */
function createGuideWindow() {
  const html = `
    <div class="guide-layout">
      <h2>QamarOS Guide</h2>
      <p><strong>Creator:</strong> Byteforge0 (real name: Yazen Alsaho)</p>
      <p>Byteforge0 and Yazen Alsaho are the same person.</p>

      <div class="guide-box">
        <h3>Login</h3>
        <ul>
          <li>On first start, create a username and password.</li>
          <li>After that, log in using those credentials.</li>
        </ul>
      </div>

      <div class="guide-box">
        <h3>Desktop</h3>
        <ul>
          <li>Click desktop icons to open apps.</li>
          <li>Right-click the desktop to open the context menu.</li>
          <li>Use the top search bar to filter icons.</li>
        </ul>
      </div>

      <div class="guide-box">
        <h3>Taskbar</h3>
        <ul>
          <li>The taskbar always shows: Made by Byteforge0 (Yazen Alsaho).</li>
          <li>Open apps appear in the center of the taskbar.</li>
          <li>Click an active app button to minimize it.</li>
          <li>Click a minimized app button to restore it.</li>
        </ul>
      </div>

      <div class="guide-box">
        <h3>Recycle Bin</h3>
        <ul>
          <li>Open the Recycle Bin from the desktop, start menu, or context menu.</li>
          <li>You can empty it using the "Empty Bin" button.</li>
        </ul>
      </div>
    </div>
  `;

  return createWindow("Guide", "guide", html, 860, 620);
}

/* ---------------- About ---------------- */
function createAboutWindow() {
  const html = `
    <div class="about-card">
      <h2>About QamarOS</h2>
      <p><strong>QamarOS</strong> is a futuristic desktop OS concept built as a portfolio project.</p>
      <p><strong>Made by Byteforge0 (Yazen Alsaho)</strong></p>
      <p>Byteforge0 and Yazen Alsaho are the same person.</p>
      <p><strong>Version:</strong> 5.0</p>
    </div>
  `;

  return createWindow("About QamarOS", "about", html, 620, 380);
}

/* ---------------- Saved Data ---------------- */
const savedTheme = localStorage.getItem("qamar_theme") || "theme-blue";
const savedWallpaper = localStorage.getItem("qamar_wallpaper") || "wallpaper-1";

setTheme(savedTheme);
setWallpaper(savedWallpaper);
syncTaskbar();