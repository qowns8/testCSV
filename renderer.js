const { ipcRenderer } = require("electron");

window.onload = () => {
  const btnEl = document.getElementById("btn");

  btnEl.addEventListener("click", (evt) => {
    // onInputValue 이벤트 송신
    ipcRenderer.send("show-open-dialog");
  });

  // replyInputValue에 대한 응답 수신
  ipcRenderer.on("open-dialog-paths-selected", (evt, payload) => {
    const columnDefs = Object.keys(payload.$columns).map((field) => ({
      field,
      sortable: true,
    }));

    // let the grid know which columns and what data to use
    const gridOptions = {
      columnDefs,
      rowData: payload.$data,
    };

    //      const columnDefs = Object.keys(payload.$columns).map((key) => ({
    //   field: key,
    //   sortable: true,
    // }));

    // // let the grid know which columns and what data to use
    // const gridOptions = {
    //   columnDefs,
    //   rowData: payload.$data,
    // };
    const gridDiv = document.querySelector("#myGrid");
    new agGrid.Grid(gridDiv, gridOptions);

    // setup the grid after the page has finished loading

    // document.getElementById("text-box").textContent = payload;
  });
};
