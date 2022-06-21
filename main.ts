import path from "path";
import {
  app,
  Menu,
  Tray,
  Notification,
  MenuItemConstructorOptions,
  nativeTheme,
} from "electron";

const appName = "52-17";
const minutesPerWorkSession = 52;
const minutesPerBreak = 17;
const msPerMinute = 60000;
const isWindows = process.platform === "win32";

const defaultMenuItems: MenuItemConstructorOptions[] = [
  {
    label: "Start working",
    click: startWorking,
  },
  {
    label: "Start break",
    click: startBreak,
  },
  {
    type: "separator",
  },
  {
    label: "Quit",
    click: () => app.quit(),
  },
];

let tray: Tray;
let currentTimer: NodeJS.Timer;

app.whenReady().then(startApplication);

function startApplication(): void {
  if (app.dock) {
    app.dock.hide();
  }

  tray = new Tray(getTrayIconPath());
  tray.setToolTip(appName);
  updateTrayMenu(defaultMenuItems);

  nativeTheme.on("updated", () => tray.setImage(getTrayIconPath()));

  if (isWindows) {
    tray.on("click", () => tray.popUpContextMenu());
    app.setAppUserModelId(appName);
  }
}

function updateTrayMenu(menuItems: MenuItemConstructorOptions[]): void {
  tray.setContextMenu(Menu.buildFromTemplate(menuItems));
}

function getTrayIconPath(): string {
  const extension = isWindows ? "ico" : "png";
  const theme = nativeTheme.shouldUseDarkColors ? "light" : "dark";
  return path.join(__dirname, "..", "images", `icon-${theme}.${extension}`);
}

function startWorking(): void {
  createNewTimer(
    (timeString) => `Get your work done! Next break at ${timeString}.`,
    minutesPerWorkSession,
    startBreak
  );
}

function startBreak(): void {
  createNewTimer(
    (timeString) => `Take a break! Work starts again at ${timeString}.`,
    minutesPerBreak,
    startWorking
  );
}

function createNewTimer(
  getMessage: (time: string) => string,
  minutes: number,
  timerCallback: () => void
) {
  clearInterval(currentTimer);

  const now = new Date();
  const endTime = new Date(
    now.getTime() - now.getSeconds() + minutes * msPerMinute
  );

  const timeString = getFormattedTime(endTime);
  const message = getMessage(timeString);

  updateTrayMenu([
    {
      label: message,
      enabled: false,
    },
    { type: "separator" },
    { label: "Stop timer", click: stopTimer },
    { type: "separator" },
    ...defaultMenuItems,
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

function getFormattedTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function stopTimer(): void {
  clearInterval(currentTimer);
  updateTrayMenu(defaultMenuItems);
  new Notification({ title: "Timer stopped" }).show();
}
