/**
 * # Logic code for Ultimatum Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 *
 * http://www.nodegame.org
 */
var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var J = ngc.JSUS;

// Flag to not cache required files.
var nocache = true;

// Here we export the logic function. Receives three parameters:
// - node: the NodeGameClient object.
// - channel: the ServerChannel object in which this logic will be running.
// - gameRoom: the GameRoom object in which this logic will be running.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var channel = gameRoom.channel;
    var node = gameRoom.node;

    // Import other functions used in the game.
    // Some objects are shared.
    var cbs = channel.require(__dirname + '/includes/logic.callbacks.js', {
        node: node,
        gameRoom: gameRoom,
        settings: settings
        // Reference to channel added by default.
    }, nocache);

    // Event handler registered in the init function are always valid.
    stager.setOnInit(cbs.init);
    
    // `minPlayers` triggers the execution of a callback in the case
    // the number of players (including this client) falls the below
    // the chosen threshold. Related: `maxPlayers`, and `exactPlayers`.
    // However, the server must be configured to send this information
    // to the clients, otherwise the count will be always 0 and
    // trigger the callback immediately. Notice that minPlayers is
    // configured on logic.js as well.
    // minPlayers: MIN_PLAYERS,
    stager.setDefaultProperty('minPlayers', [
        settings.MIN_PLAYERS,
        cbs.notEnoughPlayers
    ]);

    stager.setDefaultProperty('pushClients', true);
    
    stager.extendStep('selectLanguage', {     
        cb: function() {
            // Storing the language setting.
            node.on.data('mylang', function(msg) {
                if (msg.data && msg.data.name !== 'English') {
                    channel.registry.updateClient(msg.from, { lang: msg.data });
                }
            });
        }
    });

    stager.extendStep('bidder', {
        matcher: {
            roles: [ 'BIDDER', 'RESPONDENT', 'SOLO' ],
            // match: 'random_pairs',
            match: 'roundrobin',
            cycle: 'repeat_invert',
            // skipBye: false
            // setPartner: true // default
        }
    });

    stager.extendStage('ultimatum', {
        reconnect: cbs.reconnectUltimatum
    });

    stager.extendStep('questionnaire', {
        minPlayers: undefined
    });

    stager.extendStep('endgame', {
        cb: cbs.endgame,
        minPlayers: undefined,
        steprule: stepRules.SOLO
    });

//     // Here we group together the definition of the game logic.
//     return {
//         // Extracts, and compacts the game plot that we defined above.
//         plot: stager.getState(),
//         // Controls the amount of information printed to screen.
//         verbosity: -100
//     };

};
