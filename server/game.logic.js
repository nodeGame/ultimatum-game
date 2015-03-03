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
module.exports = function(node, channel, gameRoom, treatmentName, settings) {
   // Increment counter.
    counter = counter ? ++counter : settings.SESSION_ID;

    // Client game to send to reconnecting players.
    // The client function needs to be given a treatment name and
    // the treatment options, and it returns a game object.
    // TODO: Only pass the options from the current treatment; at
    // the moment, the entire game.settings structure is passed.
    var client = require(gameRoom.gamePaths.player)(
            gameRoom, treatmentName, settings);

    // Reads in descil-mturk configuration.
    var basedir = channel.resolveGameDir('ultimatum');
    var confPath = basedir + '/auth/descil.conf.js';
    var dk = require('descil-mturk')(confPath);

    // Import the stager.
    var gameSequence = require(__dirname + '/game.stages.js')(settings);
    var stager = ngc.getStager(gameSequence);

    // Import other functions used in the game.
    // Some objects are shared.
    var cbs = channel.require(__dirname + '/includes/logic.callbacks.js', {
        node: node,
        gameRoom: gameRoom,
        settings: settings,
        dk: dk,
        client: client,
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

    // Here we group together the definition of the game logic.
    return {
        nodename: 'lgc' + counter,
        game_metadata: {
            name: 'ultimatum',
            version: '0.1.0'
        },
        game_settings: {
            // Will not publish any update of stage / stageLevel, etc.
            publishLevel: 0,
            // Will send a start / step command to ALL the clients when
            // the logic will start / step through the game.
            // This option requires that the game plots of the clients
            // and logic are symmetric or anyway compatible.
            syncStepping: true
        },
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
