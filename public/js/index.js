/**
 * # Index script for nodeGame
 * Copyright(c) 2020 Stefano Balietti
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
    // Note! If using an alias or running as default, must specify channel:
    // node.connect("/ultimatum");
    node.connect();
};
