/**
 * # Requirements settings
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 *
 * Requirements settings file.
 *
 * Write custom test in requirements.js
 *
 * http://www.nodegame.org
 * ---
 */

module.exports = {

    /**
     * ## enabled
     *
     * If TRUE, it creates a requirements room. Default, TRUE
     */
    enabled: true,

    /**
     * ## maxExecTime
     *
     * If set, limits the maximum execution time for all requirement tests
     */
    maxExecTime: 6000,

    /**
     * ## speedTest
     *
     * If set, client must exchange messages with server "quickly enough"
     */
    // speedTest: {
    //     messages: 1,
    //     time: 2000
    // },

    /**
     * ## cookieSupport
     *
     * If set, client must support setting cookies.
     *
     * Accepted values:
     *
     *   - 'persistent': cookies must persist across session
     *   - 'session': cookies must be set within same session
     */
    cookieSupport: 'persistent',

    /**
     * ## viewportSize
     *
     * If set, client must have a resolution between the min and max specified
     */
    // viewportSize: {
    //     minX: 800,
    //     minY: 600,
    //     // maxX: 13660,
    //     // maxY: 7680
    // },

    /**
     * ## browserDetect
     *
     * Checks the browser and device
     *
     * Available options (more will be added):
     *
     *  - parser: (optional) a function that will parse the userAgent.
     *            Default function is `ua-parser-js`
     *  - cb: a callback that takes an object containing the parsed userAgent
     *        and must return an object of the type:
     *        { success: true/false, errors: undefined|array of strings }
     *
     * @see https://github.com/faisalman/ua-parser-js
     */
    // browserDetect: {
    //     cb: function(ua, params) {
    //         if (ua.device.model || ua.device.type) {
    //             return {
    //                 success: false,
    //                 errors: [ 'It seems you are using a mobile or tablet ' +
    //                           'device. You can participate to this game ' +
    //                           'only from a desktop or laptop computer ' +
    //                           'with a keyboard and a mouse. If you ' +
    //                           'can, try with another browser or device.' ]
    //             };
    //         }
    //
    //         return { success: true };
    //     }
    // },

    /**
     * ## nextRoom
     *
     * If set, clients that pass the requirements are moved to this room.
     *
     * Default: the waiting room
     */
    // nextRoom: 'mynextroom',

    /**
     * ## doChecking
     *
     * If TRUE, start testing the requirements immediately. Default, TRUE
     */
    doChecking: true,

    /**
     * ## logicPath
     *
     * Alternative path for a custom requirements room.
     */
    // logicPath: './requirements.room.js',

    // # Reserved words for future requirements settings.

    //  mode: 'auto',
    //
    //  page: 'requirements.htm'

};
