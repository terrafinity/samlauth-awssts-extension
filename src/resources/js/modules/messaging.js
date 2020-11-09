import Settings from "./settings.js";

export default class Messaging {
    static debugMessage(message, ...optionalParams) {
        if (Settings.Debugging) {
            console.debug(message, optionalParams);
        }
    }
}