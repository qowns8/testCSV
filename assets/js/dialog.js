const { ipcRenderer } = require("electron");

ipcRenderer.on("open-dialog-paths-selected", (event, arg) => {
  console.log(arg);
  console.timeEnd("csv read");
  dialog.handler.outputSelectedPathsFromOpenDialog(arg);
});

ipcRenderer.on("show-message-box-response", (event, args) => {
  dialog.handler.outputMessageboxResponse(args);
});

(window.dialog = window.dialog || {}),
  (function (n) {
    dialog.handler = {
      showOpenDialog: function () {
        ipcRenderer.send("show-open-dialog");
      },

      outputSelectedPathsFromOpenDialog: function (paths) {
        alert("user selected: " + paths);
      },

      outputMessageboxResponse: function (args) {
        alert(
          "user selected button index: " +
            args[0] +
            ". Should remember answer value is: " +
            args[1]
        );
      },

      showErrorBox: function () {
        ipcRenderer.send("show-error-box");
      },

      showMessageBox: function () {
        ipcRenderer.send("show-message-box");
      },

      showSaveDialog: function () {
        ipcRenderer.send("show-save-dialog");
      },

      init: function () {
        $("#showOpendialog").click(function () {
          dialog.handler.showOpenDialog();
        });

        $("#showErrorBox").click(function () {
          dialog.handler.showErrorBox();
        });

        $("#showMessageBox").click(function () {
          dialog.handler.showMessageBox();
        });

        $("#showSaveDialog").click(function () {
          dialog.handler.showSaveDialog();
        });
      },
    };

    n(function () {
      dialog.handler.init();
    });
  })(jQuery);
