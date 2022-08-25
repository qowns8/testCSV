const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs"); // Load the File System to execute our common tasks (CRUD)
const dfd = require("danfojs-node");
const {parseCsv, groupByMulti} = require("./shardWorker");

let data;
const data2 = [];

let threeResult = []

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1281,
    height: 800,
    minWidth: 300,
    minHeight: 400,
    backgroundColor: "#312450",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.webContents.openDevTools();
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open File",
          click() {
            // openFile();
            openFileWithDanfo();
          },
        },
        {
          label: 'Three They Come',
          click() {
            threeTheyCome()
          }
        }
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
  // 웹 페이지 로드 완료
  mainWindow.webContents.on("did-finish-load", (evt) => {
    // onWebcontentsValue 이벤트 송신
    mainWindow.webContents.send("onWebcontentsValue", "on load...");
  });

  ipcMain.on('new-browser-thread-parse', (event, data) => {
    console.timeEnd('new-browser-thread-parse')
    mainWindow.webContents.send('open-dialog-paths-selected', data[0])
  })
  ipcMain.on('new-browser-thread-groupBy', (event, data) => {
    console.log('new-browser-thread-groupBy', threeResult.length)
    if (threeResult.length === 2) {
      mainWindow.webContents.send('open-dialog-paths-selected', dfdConcatAndSum(
          [threeResult[0], threeResult[1], data[0]],
          [
            'attributed_touch_type',
            'event_name'],
          ['appsflyer_id_count']
          ))
      console.timeEnd('new-browser-thread-groupBy');
      threeResult = []
    } else {
      threeResult.push(data[0])
    }
  })
  function dfdConcatAndSum(array, groupByCol, selectCol) {
    // console.log('dfdConcatAndSumArgs', array, groupByCol, selectCol)
    const r1 = new dfd.DataFrame([...array[0]?.$data, ...array[1]?.$data, ...array[2]?.$data], { columns: array[0]?.$columns, dtypes: array[0]?.$dtypes})
    console.log('pass r1')
      const r2 =
        r1.groupby(
            groupByCol
        )
        .col(selectCol)
        .sum()

    console.log('pass r2')
    return r2
  }
  // function multiMerge(dfArgs){
  //   return dfArgs.reduce((sum, now) => (dfdMerge(sum, now)))
  // }
  // function dfdMerge(df1, df2) {
  //   return dfd.merge({
  //     left: df1,
  //     right: df2,
  //     on: [
  //       'attributed_touch_type',
  //       'event_name'
  //     ],
  //     how: "left"
  //   })
  // }

  function openFile() {
    const files = dialog
      .showOpenDialog(mainWindow, {
        properties: ["openFile"],
      })
      .then((result) => {
        console.time("csv read");
        const file = result.filePaths[0];

        fs.createReadStream(file)
          .pipe(csv.parse({ headers: true }))
          .on("error", (error) => console.error(error))
          .on("data", (row) => data2.push(row))
          .on("end", () => {
            let end = performance.now();

            console.timeEnd("csv read");
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  function openFileWithDanfo() {
    const files = dialog
      .showOpenDialog(mainWindow, {
        properties: ["openFile"],
      })
      .then(async (result) => {
        console.time('new-browser-thread-parse');
        const filePath = result.filePaths[0];
        await parseCsv(filePath, mainWindow.webContents)
      })
      .catch((err) => {
        console.log(err);
      });
  }
  //세명이 오리라...
  function threeTheyCome() {
    const files = dialog
        .showOpenDialog(mainWindow, {
          filters:  { name: 'All Files', extensions: ['*'] },
          properties: ["openFile", "multiSelections"],
        })
        .then(async (result) => {
          const filePaths = result.filePaths;
          threeResult = []
          if (filePaths.length !== 3) {
            console.log('not three')
            return
          }
          console.time('new-browser-thread-groupBy');
          await groupByMulti(filePaths, mainWindow.webContents)
        })
        .catch((err) => {
          console.log(err);
        });

  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on("show-open-dialog", (event, arg) => {
    const options = {
      //title: 'Open a file or folder',
      //defaultPath: '/path/to/something/',
      //buttonLabel: 'Do it',
      /*filters: [
        { name: 'xml', extensions: ['xml'] }
      ],*/
      //properties: ['showHiddenFiles'],
      //message: 'This message will only be shown on macOS'
    };
    dialog
      .showOpenDialog(null, {
        properties: ["openFile"],
      })
      .then((result) => {
        const file = result.filePaths[0];
        console.time("csv read");
        dfd
          .readCSV(file) //assumes file is in CWD
          .then((df) => {
            data = df;
            console.timeEnd("csv read");
            event.sender.send("open-dialog-paths-selected", data);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });

  ipcMain.on('data-length', (event, data) => {
    console.log('data-length', data)
  })

  // onInputValue 이벤트 수신
  ipcMain.on("onInputValue", (evt, payload) => {
    console.log("on ipcMain event:: ", payload);

    const computedPayload = payload + "(computed)";

    // replyInputValue 송신 또는 응답
    evt.reply("replyInputValue", data || data2);
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
