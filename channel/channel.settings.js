/**
 * # Channels definition file for Ultimatum Game
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Configurations options for channel.
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    // If FALSE, this channel is not loaded. Default: TRUE.
    enabled: true,

    // Makes the experiment available at /myexperiment insted of /ultimatum.
    // alias: 'myexperiment',

    // Player endpoint for socket.io connection.
    playerServer: 'ultimatum',

    // Admin endpoint for socket.io connection.
    adminServer: 'ultimatum/admin',

    // Channel output verbosity.
    verbosity: 100,

    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: true,

    // Unauthorized clients will be redirected here.
    // (defaults: "/pages/accessdenied.htm")
    accessDeniedUrl: '/ultimatum/unauth.htm',

    // If TRUE, reconnections are enabled (authorization or noAuth cookie
    // necessary).
    enableReconnections: true,

    // If TRUE, a cookie is set even without authorization. Opening
    // multiple browser tabs will cause a disconnection in other ones.
    // noAuthCookie: true,

    // If TRUE, every newly created room is assigned an own subdirectory
    // inside the game data/ dir. Default: TRUE
    // roomOwnDataDir: true

    // If undefined it looks into the data folder and self-initialize to
    // the next available id, starting from 1.
    // roomCounter: 100,

    // If set, leading 0 are added to the room counter to reach the
    // desired length. For example, if `roomCounterChars` is equal to 6 and
    // the current roomCounter value is 123, then room name is: '000123'.
    // Default: 6
    // roomCounterPadChars: 6,

    // If TRUE, channel is served from /
    // Notice! Other games might not be available and need to adapt
    // manually access point in index.htm
    //
    // Note! Make sure that the endpoint is specified in public/js/index.js.
    //
    // @deprecated. Use option --default at startup
    defaultChannel: false

    /**
     * ## logClients
     *
     * If TRUE, all connected/disconnected clients are logged to a csv file
     *
     * Default: FALSE
     */
    // logClients: true,

    /**
     * ## logClientsExtra
     *
     * Adds additional fields to the file of logged clients
     *
     * Default: undefined
     */
    // logClientsExtra: function(p) {
    //     return [ p.WorkerId || 'NA', p.HITId || 'NA',
    //              p.AssignmentId || 'NA', p.ExitCode || 'NA' ];
    // },

    /**
    * ## logClientsInterval
    *
    * How often (in milliseconds) data about clients is written to file system
    *
    * Default: 10000
    */
    // logClientsInterval: 10000,

    /**
     * ## page404
     *
     * A custom page displayed when a resource is not found.
     *
     * Default: '404.htm'
     */
    // page404: '404.htm',

    /**
     * ## collectIp
     *
     * If TRUE, the IP address is collected and stored.
     *
     * Default: FALSE
     */
    //  collectIp: true


    // # Reserved for future versions:

    // If set, this symbol is inserted between the padded room counter and
    // and the word 'room'.
    // Default: ''
    // roomCounterSeparator: '@'
};
