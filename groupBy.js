//
// const dfd = require("danfojs-node");
// const {ipcRenderer } = require('electron');
window.onload = () => {
    // import * as dfd from 'danfojs-node'
    // import {ipcRenderer} from 'electron'
    console.log('fn call', window.api.ipcRenderer)
    window.api.ipcRenderer.on(
        'groupBy',
        (event, [path]) => {
            console.log('enter groupBy')
            let data;
            console.log('api', window.api)
            console.log('path is', path)
            dfd
                .readCSV(path) //assumes file is in CWD
                .then((df) => {
                    //attributed_touch_type	attributed_touch_time	install_time	event_time	event_name
                    data = df.groupby([
                        'attributed_touch_type',
                        'event_name'
                    ]).col(['appsflyer_id'])
                        .count()
                    console.log('data : ', data)
                    window.api.ipcRenderer.send("new-browser-thread-groupBy", data);
                    setTimeout(() => {
                        window.close()
                    }, 30000)
                    // window.api.ipcRenderer.send("data-length", [data.length]);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    )
}