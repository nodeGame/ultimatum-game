/**
 * # Game setup
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = function(settings, stages) {
    
    var game = {};

    // Metadata. Taken from package.json. Can be overwritten.    
    // game.metadata = {
    //    name: 'burdenSharingControl',
    //    version: '0.1.0',
    //    description: 'no descr'
    // };

    // If debug is false (default false), exception will be caught and
    // and printed to screen, and the game will continue.
    game.debug = true;

    game.verbosity = -1;

    game.window = {
        promptOnleave: !game.debug,
        disableRightClick: false
    }

    return game;
};
