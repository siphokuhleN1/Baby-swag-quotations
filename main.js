const { app, BrowserWindow } = require("electron");
const next = require("next");
const path = require("path");

const port = 3000;
const dev = false; // always production inside exe
const nextApp = next({ dev, dir: path.join(__dirname) });
const handle = nextApp.getRequestHandler();

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  await nextApp.prepare();

  // Load app
  mainWindow.loadURL(`http://localhost:${port}`);
}

// Start a mini HTTP server inside Electron
const { createServer } = require("http");
nextApp.prepare().then(() => {
  const server = createServer((req, res) => handle(req, res));
  server.listen(port, async () => {
    console.log(`Next server running at http://localhost:${port}`);
    await createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});