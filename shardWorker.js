const { BrowserWindow, ipcRenderer} = require("electron");
const fs = require("fs");
const dfd = require("danfojs-node");
const path = require("path");
async function createNewWorker(loadPath) {
    return new Promise((resolve, reject) => {
        const window = new BrowserWindow({
            //show: false,
            webPreferences: {
                preload: path.join(__dirname, "preload.js"),
                nodeIntegration: true,
                contextIsolation: true,
                nodeIntegrationInWorker: true,
            }
        });
        window.on('ready-to-show', () => {
            console.log('ready to show subWindows')
            resolve(window)

        })
        window.on('close', () => {
            console.log('window close')
        })
        window.loadFile(loadPath)
    })
}

function send(channel, args) {
    return (window) => {
        return window.webContents.send(channel, args)
    }
}

function end(window) {
}

async function parseCsv(path) {
    const window = await createNewWorker('workerParse.html')
    window.on('shutdown', () => {
        end(window)
    })
    window.openDevTools()
    send(
        'parseCsv',
        [path]
    )(window)
}

async function groupByMulti(paths) {
    for (let path of paths) {
        const window = await createNewWorker('workerGroupBy.html')
        window.on('shutdown', () => {
            end(window)
        })
        window.openDevTools()
        send(
            'groupBy',
            [path]
        )(window)
    }
}

module.exports = {
    parseCsv,
    groupByMulti
}