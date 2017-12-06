/**
 * # Requirements settings
 * Copyright(c) 2016 Stefano Balietti
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
    speedTest: {
        messages: 1,
        time: 1000
    },

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
    cookieSupport: 'persistent'

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
    // doChecking: true,

    /**
     * ## logicPath
     *
     * Alternative path for a custom requirements room.
     */
    // logicPath: './requirements.room.js',

    // # Reserved words for future requirements settings.

    //  mode: 'auto',
    // 
    //  page: 'requirements.htm',

    //  excludeBrowsers: {
    //      browser: 'netscape'
    //  },

};
