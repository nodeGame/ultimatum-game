/**
 * # Logic code for Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 * Extensively documented tutorial.
 *
 * Info:
 * Matching, and stepping can be done in different ways. It can be
 * centralized, and the logic tells the clients when to step, or
 * clients can synchronize themselves and step automatically.
 *
 * In this game, the logic is synchronized with the clients. The logic
 * will send automatically game-commands to start and step
 * through the game plot whenever it enters a new game step.
 *
 * http://www.nodegame.org
 */

var path = require('path');

//var Database = require('nodegame-db').Database;
// Variable _node_ is shared by the requiring module
// (game.room.js) through `channel.require` method.
//var ngdb = new Database(module.parent.exports.node);
//var mdb = ngdb.getLayer('MongoDB');

var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var J = ngc.JSUS;

// Variable registered outside of the export function
// are shared among all instances of game logics.
var counter = 0;

// Flag to not cache required files.
var nocache = true;

// Here we export the logic function. Receives three parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which this logic will be running.
// - gameRoom: the GameRoom object in which this logic will be running.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var channel = gameRoom.channel;
    var node = gameRoom.node;

    // Increment counter.
    counter = counter ? ++counter : settings.SESSION_ID;

    // Import other functions used in the game.
    // Some objects are shared.
    var cbs = channel.require(__dirname + '/includes/logic.callbacks.js', {
        node: node,
        gameRoom: gameRoom,
        settings: settings,
        counter: counter
        // Reference to channel added by default.
    }, nocache);

    // Event handler registered in the init function are always valid.
    stager.setOnInit(cbs.init);

     // Event handler registered in the init function are always valid.
    stager.setOnGameOver(cbs.gameover);

    // Extending default stages.

    // Set default step rule.
    stager.setDefaultStepRule(stepRules.OTHERS_SYNC_STEP);

    stager.setDefaultProperty('minPlayers', [ 
        settings.MIN_PLAYERS,
        cbs.notEnoughPlayers
    ]);

// TODO: this should work in the future. It will avoid to
// to extend all the other stages.
//     stager.setDefaultProperty('cb', {
//         cb: function() {}
//     });

    stager.extendStep('precache', {
        cb: function() {}
    });
    
    stager.extendStep('selectLanguage', {
        cb: function() {}
    });
    
    stager.extendStep('instructions', {
        cb: function() {}
    });
    
    stager.extendStep('quiz', {
        cb: function() {}
    });

    stager.extendStep('questionnaire', {
        cb: function() {},
        minPlayers: undefined
    });

    stager.extendStep('ultimatum', {
        cb: function() {
            this.node.log('Ultimatum');
            cbs.doMatch();
        }
    });

    stager.extendStep('endgame', {
        cb: cbs.endgame,
        minPlayers: undefined,
        steprule: stepRules.SOLO
    });

    stager.setDefaultProperties({
        publishLevel: 0,
        syncStepping: true
    });

    // Here we group together the definition of the game logic.
    return {
        nodename: 'lgc' + counter,
        // Extracts, and compacts the game plot that we defined above.
        plot: stager.getState(),
        // If debug is false (default false), exception will be caught and
        // and printed to screen, and the game will continue.
        debug: settings.DEBUG,
        // Controls the amount of information printed to screen.
        verbosity: 0,
        // nodeGame enviroment variables.
        env: {
            auto: settings.AUTO
        }
    };

};