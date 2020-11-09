import Messaging from './modules/messaging.js'
import Settings from './modules/settings.js'

Settings.initialize();

function saveSettings() {
    Settings.FileName = $("#filename").val();
    Settings.ApplyIdpDuration = $("#applyidpduration").prop("checked");
    Settings.Debugging = $("#debug").prop("checked");
    for (var accIndex = 0; accIndex < Number($("#add-account").attr("data-next-id")); accIndex++) {
        var accountId = $("input.accountid[data-id='" + accIndex + "']").val();
        var accountName = $("input.friendlyname[data-id='" + accIndex + "']").val();
        if (accountId != undefined && accountName != undefined && accountId != "" && accountName != "") {
            Settings.FriendlyAccountNames[accountId] = accountName;
        }
    }
    Settings.saveStorage();
}

function createAccountRow(id, addDeleteButton, accountId, friendlyName) {
    var optDiv = document.createElement("div");
    optDiv.setAttribute("class", "option");
    optDiv.setAttribute("data-id", id);
    var accountInput = document.createElement("input");
    accountInput.setAttribute("type", "text");
    accountInput.setAttribute("class", "accountid");
    accountInput.setAttribute("data-id", id);
    accountInput.setAttribute("placeholder", "account id");
    if (accountId != undefined) { accountInput.setAttribute("value", accountId) }
    optDiv.appendChild(accountInput);
    var nameInput = document.createElement("input");
    nameInput.setAttribute("type", "text");
    nameInput.setAttribute("class", "friendlyname");
    nameInput.setAttribute("data-id", id);
    nameInput.setAttribute("placeholder", "default");
    if (friendlyName != undefined) { nameInput.setAttribute("value", friendlyName) }
    optDiv.appendChild(nameInput);
    if (addDeleteButton != undefined && addDeleteButton) {
        var delButton = document.createElement("button");
        delButton.setAttribute("data-id", id);
        delButton.innerText = "DEL";
        delButton.addEventListener("click", function(evt) {
            var indexToDelete = $(this).attr("data-id");
            var accountToDelete = $("input.accountid[data-id='" + indexToDelete + "']").val();
            if (accountToDelete != undefined && accountToDelete != "") {
                delete Settings.FriendlyAccountNames[accountToDelete];
                reloadFriendlyNames();
            }
        });
        optDiv.appendChild(delButton);
    }
    return optDiv;
}

function reloadSettings() {
    Settings.loadStorage(() => {
        $("#filename").val(Settings.FileName);
        $("#applyidpduration").prop("checked", Settings.ApplyIdpDuration);
        $("#debug").prop("checked", Settings.Debugging);
        reloadFriendlyNames();
    });
}

function reloadFriendlyNames() {
    Messaging.debugMessage("Clearing accounts");
    $("#account-table").empty();
    var keyIndex = 0;
    for (var key in Settings.FriendlyAccountNames) {
        if (Settings.FriendlyAccountNames.hasOwnProperty(key)) {
            $("#account-table").append(createAccountRow(keyIndex, true, key, Settings.FriendlyAccountNames[key]));
            keyIndex++;
        }
    }
    $("#account-table").append(createAccountRow(keyIndex));
    $("#add-account").attr("data-next-id", keyIndex+1);
}

$("#general-link").click((evt) => {
    $("#general-sidebar").attr("class","menu-active");
    $("#account-sidebar").attr("class","menu-inactive");
    $("#role-sidebar").attr("class","menu-inactive");

    $("#general-opt").addClass("visible");
    $("#accounts-opt").removeClass("visible");
    $("#roles-opt").removeClass("visible");
});

$("#account-link").click((evt) => {
    $("#general-sidebar").attr("class","menu-inactive");
    $("#account-sidebar").attr("class","menu-active");
    $("#role-sidebar").attr("class","menu-inactive");

    $("#general-opt").removeClass("visible");
    $("#accounts-opt").addClass("visible");
    $("#roles-opt").removeClass("visible");
});

$("#role-link").click((evt) => {
    $("#general-sidebar").attr("class","menu-inactive");
    $("#account-sidebar").attr("class","menu-inactive");
    $("#role-sidebar").attr("class","menu-active");

    $("#general-opt").removeClass("visible");
    $("#accounts-opt").removeClass("visible");
    $("#roles-opt").addClass("visible");
});

$("#add-account").click((evt) => {
    Messaging.debugMessage("Adding new account row");
    $("#account-table").append(createAccountRow($("#add-account").attr("data-next-id")));
    $("#add-account").attr("data-next-id", Number($("#add-account").attr("data-next-id"))+1);
});

$("#save-button").click((evt) => {
    saveSettings();
});
$("#revert-button").click((evt) => {
    reloadSettings();
});

reloadSettings();