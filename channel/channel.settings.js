/**
 * # Channels definition file for Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Configurations options for channel.
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    // alias: 'u1',

    playerServer: 'ultimatum',

    adminServer: 'ultimatum/admin',

    verbosity: 100,

    // If TRUE, players can invoke GET commands on admins.
    getFromAdmins: true,

    // Unauthorized clients will be redirected here.
    // (defaults: "/pages/accessdenied.htm")
    accessDeniedUrl: '/ultimatum/unauth.htm',

    enableReconnections: true,

    // If undefined it looks into the data folder and self-initialize to
    // the next available id, starting from 1.
    // roomCounter: 100,

    // If TRUE, every newly created room is assigned an own subdirectory
    // inside the game data/ dir. Default: TRUE
    // roomOwnDataDir: true
};

