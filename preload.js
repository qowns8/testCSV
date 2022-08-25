// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }
//
//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
// })
// window.dfd = require('danfojs-node')
//const dfd = require('danfojs-node')

const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('api', {
    //dfd: () => dfd,
    hello: () => console.log('hello world'),
    ipcRenderer: {
        on: (...args) => ipcRenderer.on(...args),
        send: (channel, ...args) => {
            console.log('channel', channel, args)
            return ipcRenderer.send(channel, args)
        },
    },
})