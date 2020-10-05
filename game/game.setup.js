/**
 * # Game setup
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = function(settings, stages) {

    return {

        // Metadata. Taken from package.json. Can be overwritten.
        // game.metadata: {
        //    name: 'burdenSharingControl',
        //    version: '0.1.0',
        //    description: 'no descr'
        // },

        // If debug is false (default false), exception are caught and
        // and printed to screen, and the game continues.
        debug: true,

        // verbosity: -1,

        window: {
            promptOnleave: !game.debug,
            disableRightClick: false
        }
    };
};
