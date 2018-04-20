/**
 * # Channels definition file for Ultimatum Game
 * Copyright(c) 2018 Stefano Balietti
 * MIT Licensed
 *
 * Configurations options for channel.
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    // alias: 'myexperiment',

    playerServer: 'ultimatum',

    adminServer: 'ultimatum/admin',

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
    // roomCounterPadChars: 6

    // Reserved for future versions:

    // If set, this symbol is inserted between the padded room counter and
    // and the word 'room'.
    // Default: ''
    // roomCounterSeparator: '@'

    // If TRUE, channel is served from /
    // Notice! Other games might not be available and need to adapt
    // manually access point in index.htm
    defaultChannel: false
};

