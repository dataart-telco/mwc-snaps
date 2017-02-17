const electron = require('electron')
const fs = require("fs")
const app = electron.app;
const BrowserWindow = electron.BrowserWindow
const logger = require("winston");

let mainWindow;



function createWindow() {
    mainWindow = new BrowserWindow({width: 1645, height: 1100});
    let configPath  = process.env.SNAP_USER_DATA||`${__dirname}/js`;
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    logger.add(logger.transports.File, { filename: configPath+"/app.log" });


    global.logger = logger;

    function load_js() {

        const config = fs.readFileSync(configPath+"/config.js").toString();
        const app = fs.readFileSync(`${__dirname}/js/app.js`).toString();
        mainWindow.webContents.executeJavaScript(config);
        mainWindow.webContents.executeJavaScript(app);
    }

    mainWindow.webContents.on("dom-ready", function(){
        "use strict";
        load_js()
    })

    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
})

