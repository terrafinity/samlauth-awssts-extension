import Messaging from './messaging.js'

export default class Settings {
    static initialize() {
        if (Settings._initialized) return;
        
        Messaging.debugMessage("Settings initialized");
        Settings._filename = "credentials";
        Settings._applyIdpDuration = true;
        Settings._assumeAdditionalArns = false;
        Settings._arnsToAssume = {};
        Settings._friendlyAccountNames = {};
        Settings._debugging = false;

        Settings._initialized = true;
    }
    
    static get FileName() { return Settings._filename; }
    static get ApplyIdpDuration() { return Settings._applyIdpDuration; }
    static get AssumeAdditionalArns() { return Settings._assumeAdditionalArns; }
    static get ArnsToAssume() { return Settings._arnsToAssume; }
    static get FriendlyAccountNames() { return Settings._friendlyAccountNames; }
    static get Debugging() { return Settings._debugging; }

    static set FileName(val) { Settings._filename = val; }
    static set ApplyIdpDuration(val) { Settings._applyIdpDuration = val; }
    static set AssumeAdditionalArns(val) { Settings._assumeAdditionalArns = val; }
    static set Debugging(val) { Settings._debugging = val; }

    static loadStorage(cb) {
        Messaging.debugMessage("Loading settings");
        chrome.storage.local.get({
            Settings: {
                FileName: "credentials",
                ApplyIdpDuration: true,
                AssumeAdditionalArns: false,
                ArnsToAssume: {},
                FriendlyAccountNames: {},
                Debugging: false
            }
        }, (data) => {
            Settings._filename = data.Settings.FileName,
            Settings._applyIdpDuration = data.Settings.ApplyIdpDuration,
            Settings._assumeAdditionalArns = data.Settings.AssumeAdditionalArns,
            Settings._arnsToAssume = data.Settings.ArnsToAssume,
            Settings._friendlyAccountNames = data.Settings.FriendlyAccountNames,
            Settings._debugging = data.Settings.Debugging
            if (typeof(cb)=="function") {
                cb();
            }
        });
    }

    static saveStorage(cb) {
        Messaging.debugMessage("Saving settings");
        chrome.storage.local.set({
            Settings: {
                FileName: Settings._filename,
                ApplyIdpDuration: Settings._applyIdpDuration,
                AssumeAdditionalArns: Settings._assumeAdditionalArns,
                ArnsToAssume: Settings._arnsToAssume,
                FriendlyAccountNames: Settings._friendlyAccountNames,
                Debugging: Settings._debugging
            }
        }, () => {
            Messaging.debugMessage("Settings saved");
            chrome.runtime.sendMessage({action: "reloadStorageItems"}, (response) => {
                Messaging.debugMessage(response.message);
            });
            if (typeof(cb)=="function") {
                cb();
            }
        });
    }
}