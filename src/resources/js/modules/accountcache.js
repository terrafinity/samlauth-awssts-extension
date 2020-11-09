import Messaging from './messaging.js'
import Account from '../classes/account.js';

export default class AccountCache {
    static initialize() {
        Messaging.debugMessage("AccountCache initialized");
    }

    static get Accounts() { return AccountCache.getActiveAccounts(); }

    static getActiveAccounts() {
        // filter expired logins so that they are not exported
        return AccountCache._accounts.filter(
            acc => acc.Expiry > new Date()
        );
    }

    static addAccount(account, cb) {
        // we don't want duplicates, so we filter out any accounts with this same account id
        AccountCache._accounts = AccountCache._accounts.filter(
            acc => acc.AccountId != account.AccountId
        );
        AccountCache._accounts.push(account);
        AccountCache.saveStorage(cb);
    }

    static toString() {
        var credstr = "";
        AccountCache.getActiveAccounts().forEach(account => {
            // to support single account environments, we just set the friendlyname of the account to "default" if it's the only one, and it has no friendlyname
            if (AccountCache.Accounts.length == 1 && ( account.FriendlyName == undefined || account.FriendlyName == "" )) account.FriendlyName = "default";
            credstr += account.toString();
        });
        return credstr;
    }

    static loadStorage(cb) {
        chrome.storage.local.get({
            Accounts: []
        }, (data) => {
            AccountCache._accounts = [];
            data.Accounts.forEach(sAccount => {
                if (sAccount.AccountId != undefined) {
                    var account = new Account();
                    account.FriendlyName = sAccount.FriendlyName;
                    account.AccountId = sAccount.AccountId;
                    account.RoleArn = sAccount.RoleArn;
                    account.PrincipalArn = sAccount.PrincipalArn;
                    account.AccessKeyId = sAccount.AccessKeyId;
                    account.SecretAccessKey = sAccount.SecretAccessKey;
                    account.SessionToken = sAccount.SessionToken;
                    account.Expiry = new Date(sAccount.Expiry);
                    AccountCache._accounts.push(account);
                }
            })
            if (typeof (cb) == "function") {
                cb();
            }
        });
    }

    static saveStorage(cb) {
        var accounts = [];
        AccountCache._accounts.forEach(account => {
            accounts.push({
                FriendlyName: account.FriendlyName,
                AccountId: account.AccountId,
                RoleArn: account.RoleArn,
                PrincipalArn: account.PrincipalArn,
                AccessKeyId: account.AccessKeyId,
                SecretAccessKey: account.SecretAccessKey,
                SessionToken: account.SessionToken,
                Expiry: account.Expiry.toString()
            });
        });

        chrome.storage.local.set({
            Accounts: accounts
        }, () => {
            if (typeof (cb) == "function") {
                cb();
            }
        });
    }
}
if (AccountCache._accounts == undefined) AccountCache._accounts = []