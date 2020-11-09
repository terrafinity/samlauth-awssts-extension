import AccountCache from './modules/accountcache.js'
import Messaging from './modules/messaging.js'

function createAccountRow(accountId, accountName, expiryDate) {
    let dateFormatter = Intl.DateTimeFormat([], { dateStyle: 'short', timeStyle: 'short' });

    var optDiv = document.createElement("div");
    optDiv.setAttribute("class", "account-row");
    var idElem = document.createElement("div");
    idElem.setAttribute("class", "accountid");
    idElem.innerText = accountId;
    optDiv.appendChild(idElem);
    var nameElem = document.createElement("div");
    nameElem.setAttribute("class", "accountname");
    nameElem.innerText = accountName;
    optDiv.appendChild(nameElem);
    var expiryElem = document.createElement("div");
    expiryElem.setAttribute("class", "expiry");
    expiryElem.innerText = dateFormatter.format(new Date(expiryDate));
    optDiv.appendChild(expiryElem);
    return optDiv;
}

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get({
        ExtensionActive: true
    }, function (data) {
        $("#extensionactive").prop("checked", data.ExtensionActive);
    });
    $("#extensionactive").click(toggleExtensionState);
});

function toggleExtensionState(event) {
    chrome.storage.sync.set({ ExtensionActive: $(this).prop("checked") });
    var action = "removeWebRequestEventListener";
    if ($(this).prop("checked")) {
        action = "addWebRequestEventListener";
    }
    chrome.runtime.sendMessage({ action: action }, function (response) {
        Messaging.debugMessage(response.message);
    });
}

function refreshAccounts() {
    Messaging.debugMessage("Refreshing accounts");
    AccountCache.loadStorage(() => {
        var header = $("#account-header").clone();
        $("#account-table").empty();
        $("#account-table").append(header);
        AccountCache.Accounts.forEach(account => {
            Messaging.debugMessage("Account with id %s added", account.AccountId);
            $("#account-table").append(createAccountRow(account.AccountId, account.FriendlyName, account.Expiry));
        });
    });
}

$("#refresh-icon").click(() => {
    refreshAccounts();
});

refreshAccounts();