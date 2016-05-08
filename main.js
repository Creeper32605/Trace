/*
 *  This file is part of Trace.
 *
 *  Trace is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Trace is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Trace.  If not, see <http://www.gnu.org/licenses/>.
 */

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let mainWindow = null;

app.on('window-all-closed', () => {
	app.quit();
});

app.on('ready', () => {
	mainWindow = new BrowserWindow({
		width: 800, height: 600,
		minWidth: 200, minHeight: 100,
		title: 'Trace',
		darkTheme: true,
		titleBarStyle: 'normal',
		backgroundColor: '#000',
		webPreferences: {
			experimentalFeatures: true
		}
	});
	mainWindow.loadURL(`file://${__dirname}/index.html`);
	mainWindow.on('closed', () => {
		mainWindow = null;
	});
	mainWindow.on('enter-full-screen', function() {
		mainWindow.webContents.send('fullscreen-notifier', 'true');
	});
	mainWindow.on('leave-full-screen', function() {
		mainWindow.webContents.send('fullscreen-notifier', 'false');
	});
});
ipcMain.on('asynchronous-message', function(event, arg) {
	if (arg == 'fullscreen')
		mainWindow.setFullScreen(!mainWindow.isFullScreen());
});