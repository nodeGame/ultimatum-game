/**
 * # Index script for nodeGame
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * http://nodegame.org
 * ---
 */
window.onload = function() {
    // All these properties will be overwritten
    // by remoteSetup from server.
    node.setup('nodegame', {
        verbosity: 0,
        debug : true,
        window : {
            promptOnleave : false
        },
        env : {
            auto : false,
            debug : false
        },
        events : {
            dumpEvents : true
        },
        socket : {
            type : 'SocketIo',
            reconnection : false
        }
    });
    // Connect to channel.
    // (If using an alias, must specify the right channel here).
    node.connect();
};
