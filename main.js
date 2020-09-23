const {app, Menu, Tray, Notification} = require('electron');
const path = require('path');

const MINUTES_PER_WORK_SESSION = 52;
const MINUTES_PER_BREAK = 17;
const MS_PER_MINUTE = 60000;

let tray;
let currentTimer;

app.on('ready', startApplication);

function startApplication() {
  if (app.dock) {
    app.dock.hide();
  }

  tray = new Tray(getTrayIcon());
  tray.setToolTip('52-17');
  updateMenu(getDefaultMenuItems());

  if (process.platform === 'win32') {
    tray.on('click', () => tray.popUpContextMenu());
  }
}

function getDefaultMenuItems() {
  return [
    {
      label: 'Start Working',
      click: startWorking,
    },
    {
      label: 'Start Break',
      click: startBreak,
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ];
}

function updateMenu(menuItems) {
  tray.setContextMenu(Menu.buildFromTemplate(menuItems));
}

function getTrayIcon() {
  // TODO handle dark mode and mac and etc. png on mac, ico on windows, correct sizing
  return path.join(__dirname, 'icon-light.png');
}

function startWorking() {
  createNewTimer(
    (timeString) => `Get your work done! Next break at ${timeString}.`,
    MINUTES_PER_WORK_SESSION,
    startBreak,
  );
}

function startBreak() {
  createNewTimer(
    (timeString) => `Take a break! Work starts again at ${timeString}.`,
    MINUTES_PER_BREAK,
    startWorking,
  );
}

function createNewTimer(getMessage, minutes, timerCallback) {
  clearInterval(currentTimer);

  const now = new Date();
  const endTime = new Date(
    now.getTime() - now.getSeconds() + minutes * MS_PER_MINUTE,
  );

  const timeString = getFormattedTime(endTime);
  const message = getMessage(timeString);

  updateMenu([
    {
      label: message,
      enabled: false,
    },
    {type: 'separator'},
    {label: 'Stop timer', click: stopTimer},
    {type: 'separator'},
    ...getDefaultMenuItems(),
  ]);
  new Notification({
    title: message,
  }).show();

  currentTimer = setInterval(() => {
    if (new Date() >= endTime) {
      timerCallback();
    }
  }, 1000);
}

function getFormattedTime(date) {
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
}

function stopTimer() {
  clearInterval(currentTimer);
  updateMenu([...getDefaultMenuItems()]);
  new Notification({title: 'Timer stopped'}).show();
}
