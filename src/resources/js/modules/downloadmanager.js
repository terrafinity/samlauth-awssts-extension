import Messaging from './messaging.js'

export default class DownloadManager {
    static initialize() {
        Messaging.debugMessage("DownloadManager initialized");
        DownloadManager._enableShelf = false;
    }

    static get EnableShelf() { return this._enableShelf; }

    static set EnableShelf(val) { this._enableShelf = val; }

    static saveString(filename, content) {
        chrome.downloads.setShelfEnabled(DownloadManager.EnableShelf);
        var doc = URL.createObjectURL( new Blob([content], {type: 'application/octet-binary'}) );
        chrome.downloads.download({ url: doc, filename: filename, conflictAction: 'overwrite', saveAs: false });
        chrome.downloads.setShelfEnabled(true);
    }
}