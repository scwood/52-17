const {app, Menu, Tray} = require('electron');
const path = require('path');

let tray = null;

app.on('ready', () => {
  if (app.dock) {
    app.dock.hide();
  }

  tray = new Tray(getIcon());
  tray.setToolTip('52-17');

  const menu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click() {
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);
  if (process.platform === 'win32') {
    tray.on('click', () => tray.popUpContextMenu());
  }
});

function getIcon() {
  // TODO handle dark mode
  return path.join(__dirname, 'icon-dark.png');
}
