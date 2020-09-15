const {app, Menu, Tray} = require('electron');
const path = require('path');

let tray = null;

app.on('ready', () => {
  console.log('starting');
  tray = new Tray(path.join(__dirname, 'stopwatch-solid.png'));

  if (process.platform === 'win32') {
    tray.on('click', () => console.log('hello'));
  }

  const menu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click() {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Clipmaster');
  tray.setContextMenu(menu);
});
