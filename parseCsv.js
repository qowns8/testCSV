//
// const dfd = require("danfojs-node");
// const {ipcRenderer } = require('electron');
window.onload = () => {
    // import * as dfd from 'danfojs-node'
    // import {ipcRenderer} from 'electron'
    console.log('fn call', window.api.ipcRenderer)
    window.api.ipcRenderer.on(
        'parseCsv',
        (event, [path]) => {
            console.log('enter parseCsv')
            let data;
            console.log('api', window.api)
            dfd
                .readCSV(path) //assumes file is in CWD
                .then((df) => {
                    data = df;
                    console.log('data', data)
                    window.api.ipcRenderer.send("new-browser-thread-parse", data);
                    // window.api.ipcRenderer.send("data-length", [data.length]);
                    event.sender.send('shutdown')
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    )
}