import Account from './classes/account.js'
import AccountCache from './modules/accountcache.js'
import Messaging from './modules/messaging.js'
import Settings from './modules/settings.js'
import DownloadManager from './modules/downloadmanager.js';

AccountCache.initialize();
Settings.initialize();
DownloadManager.initialize();

var initialized = false;

chrome.storage.local.get({
    ExtensionActive: true
}, (data) => {
    if (data.ExtensionActive) {
        addOnBeforeRequestEventListener();
    }
});

AccountCache.loadStorage(() => {
    Settings.loadStorage(() => {
        initialized = true;
    });
});

function addOnBeforeRequestEventListener() {
    if (chrome.webRequest.onBeforeRequest.hasListener(onBeforeRequestEvent)) {
        removeOnBeforeRequestEventListener()
    }
    chrome.webRequest.onBeforeRequest.addListener(
        onBeforeRequestEvent,
        { urls: ["https://signin.aws.amazon.com/saml"] },
        ["requestBody"]
    );
}

function removeOnBeforeRequestEventListener() {
    chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequestEvent);
}

function onBeforeRequestEvent(details) {
    if (!initialized) return;
    var account = new Account();
    var samlXmlDoc = "";
    var formDataPayload = undefined;
    if (details.requestBody.formData) {
        samlXmlDoc = decodeURIComponent(unescape(window.atob(details.requestBody.formData.SAMLResponse[0])));
    } else if (details.requestBody.raw) {
        var combined = new ArrayBuffer(0);
        details.requestBody.raw.forEach(function (element) {
            var tmp = new Uint8Array(combined.byteLength + element.bytes.byteLength);
            tmp.set(new Uint8Array(combined), 0);
            tmp.set(new Uint8Array(element.bytes), combined.byteLength);
            combined = tmp.buffer;
        });
        var combinedView = new DataView(combined);
        var decoder = new TextDecoder('utf-8');
        formDataPayload = new URLSearchParams(decoder.decode(combinedView));
        samlXmlDoc = decodeURIComponent(unescape(window.atob(formDataPayload.get('SAMLResponse'))));
    }
    var parser = new DOMParser();
    var domDoc = parser.parseFromString(samlXmlDoc, "text/xml");
    var roleDomNodes = domDoc.querySelectorAll('[Name="https://aws.amazon.com/SAML/Attributes/Role"]')[0].childNodes;
    var samlAssertion = undefined;
    var sessionDuration = domDoc.querySelectorAll('[Name="https://aws.amazon.com/SAML/Attributes/SessionDuration"]')[0];
    if (details.requestBody.formData) {
        samlAssertion = details.requestBody.formData.SAMLResponse[0];
    } else if (formDataPayload) {
        samlAssertion = formDataPayload.get('SAMLResponse');
    }

    if (sessionDuration !== undefined && Settings.ApplyIdpDuration) {
        sessionDuration = Number(sessionDuration.firstElementChild.textContent)
    } else {
        sessionDuration = null;
    }

    if (Settings.Debugging) {
        console.info('ApplySessionDuration: ' + Settings.ApplyIdpDuration);
        console.info('SessionDuration: ' + sessionDuration);
    }

    if (roleDomNodes.length > 0) {
        assumeRoleFromAssertion(account, roleDomNodes[0].innerHTML, samlAssertion, sessionDuration);
    }
}

function assumeRoleFromAssertion(account, samlattribute, samlAssertion, sessionDuration) {
    var reRole = /arn:aws:iam:[^:]*:[0-9]+:role\/[^,]+/i;
    var rePrincipal = /arn:aws:iam:[^:]*:[0-9]+:saml-provider\/[^,]+/i;
    account.RoleArn = samlattribute.match(reRole)[0];
    account.PrincipalArn = samlattribute.match(rePrincipal)[0];

    if (Settings.Debugging) {
        console.info('RoleArn: ' + account.RoleArn);
        console.info('PrincipalArn: ' + account.PrincipalArn);
    }

    var params = {
        PrincipalArn: account.PrincipalArn,
        RoleArn: account.RoleArn,
        SAMLAssertion: samlAssertion
    };
    if (sessionDuration !== null) {
        params['DurationSeconds'] = sessionDuration;
    }

    var sts = new AWS.STS();
    sts.assumeRoleWithSAML(params, (err, data) => {
        if (err) console.log(err, err.stack);
        else {
            account.AccessKeyId = data.Credentials.AccessKeyId;
            account.SecretAccessKey = data.Credentials.SecretAccessKey;
            account.SessionToken = data.Credentials.SessionToken;
            account.Expiry = data.Credentials.Expiration;
            var stsopts = { 'accessKeyId': account.AccessKeyId, 'secretAccessKey': account.SecretAccessKey, 'sessionToken': account.SessionToken };
            sts = new AWS.STS(stsopts);
            sts.getCallerIdentity({}, (err, data) => {
                if (err) console.log(err, err.stack);
                else {
                    account.AccountId = data.Account;

                    if (Settings.FriendlyAccountNames.hasOwnProperty(account.AccountId)) {
                        account.FriendlyName = Settings.FriendlyAccountNames[account.AccountId];
                    }
                    AccountCache.addAccount(account, () => {
                        DownloadManager.saveString(Settings.FileName, AccountCache.toString());
                    });
                }
            });
        }
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "reloadStorageItems") {
        Settings.loadStorage();
        AccountCache.loadStorage();
        sendResponse({ message: "Storage items reloaded in background process." });
    }
    if (request.action == "addWebRequestEventListener") {
        addOnBeforeRequestEventListener();
        sendResponse({ message: "webRequest EventListener added in background process." });
    }
    if (request.action == "removeWebRequestEventListener") {
        removeOnBeforeRequestEventListener();
        sendResponse({ message: "webRequest EventListener removed in background process." });
    }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (var key in changes) {
        Messaging.debugMessage("Key %s in namespace %s changed from '%s' to '%s'",
            key,    
            namespace,
            changes[key].oldValue,
            changes[key].newValue);
    }
});