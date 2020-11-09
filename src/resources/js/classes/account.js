import Messaging from '../modules/messaging.js'

export default class Account {
    constructor() {
        Messaging.debugMessage("Account object created");
        this._friendlyName = "";
        this._accountId = 0;
        this._roleArn = "";
        this._principalArn = "";
        this._accessKeyId = "";
        this._secretAccessKey = "";
        this._sessionToken = "";
        this._expiry = new Date();
    }

    get FriendlyName() { return this._friendlyName; }
    get AccountId() { return this._accountId; }
    get RoleArn() { return this._roleArn; }
    get PrincipalArn() { return this._principalArn; }
    get AccessKeyId() { return this._accessKeyId; }
    get SecretAccessKey() { return this._secretAccessKey; }
    get SessionToken() { return this._sessionToken; }
    get Expiry() { return this._expiry; }

    set FriendlyName(val) { this._friendlyName = val; }
    set AccountId(val) { this._accountId = val; }
    set RoleArn(val) { this._roleArn = val; }
    set PrincipalArn(val) { this._principalArn = val; }
    set AccessKeyId(val) { this._accessKeyId = val; }
    set SecretAccessKey(val) { this._secretAccessKey = val; }
    set SessionToken(val) { this._sessionToken = val; }
    set Expiry(val) { this._expiry = val; }

    toString() {
        var credstr = "";
        credstr += "[" + (this._friendlyName != "" ? this._friendlyName : this._accountId) + "]\n";
        credstr += "aws_access_key_id = " + this._accessKeyId + "\n";
        credstr += "aws_secret_access_key = " + this._secretAccessKey + "\n"
        credstr += "aws_session_token = " + this._sessionToken + "\n\n"
        return credstr;
    }
}