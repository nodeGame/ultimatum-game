/**
 * # Logic code for Ultimatum Game
 * Copyright(c) 2020 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 *
 * http://www.nodegame.org
 */
const ngc = require('nodegame-client');
const J = ngc.JSUS;

//////////////////////////////////////
// nodeGame hint: the exports function
//
// Here we export the logic function. It received five parameters:
//
//   - `treatmentName` the name of the treatment as decided by the waiting room
//   - `settings` the actual settings for the treatment (as in game.settings.js)
//   - `stager`: the stager object in which the game sequence must be defined
//   - `setup`: shared settings for all client types (as in game.setup.js)
//   - `gameRoom`: the `GameRoom` object in which this logic will be running
//
////////////////////////////////////////////////////////////////////////////
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    // Access important objects: the channel, and the node instance.
    let channel = gameRoom.channel;
    let node = gameRoom.node;
    let memory = node.game.memory;

    // Event handler registered in the init function are always valid.
    stager.setOnInit(function() {

        // Will automatically save every entry in the database
        // to file memory.json (format ndjson).
        // memory.stream();
    });

    //////////////////////////////////////////////
    // nodeGame hint: player list's size handlers
    //
    // `minPlayers` triggers the execution of a callback in the case
    // the number of players (including this client) falls below the
    // chosen threshold.
    //
    // Related variables are: `maxPlayers`, and `exactPlayers`.
    /////////////////////////////////////
    stager.setDefaultProperty('minPlayers', [
        settings.MIN_PLAYERS,
        function() { node.game.gotoStep('questionnaire'); }
    ]);

    //////////////////////////////////////
    // nodeGame hint: pushClients property
    //
    // If TRUE, the logic will try to "push" to the next step all clients
    // that seems unresponsive. This can help recover from minor errors.
    // Clients that fail to respond to the push are eventually disconnected.
    ////////////////////////////////////////////////////////////////////////
    stager.setDefaultProperty('pushClients', true);

    ///////////////////////////////////
    // nodeGame hint: reconnect handler
    //
    // For the whole stage of ultimatum (i.e. all included steps),
    // we need to take special care in handling the reconnections.
    // In fact, we need to handle all the special cases when an
    // offer has been made already, etc.
    //
    // The `reconnect` property can define a callback that handles this.
    ////////////////////////////////////////////////////////////////////
    stager.extendStage('ultimatum', {
        init: function() {
            ////////////////////////////////////////////////////
            // nodeGame hint: preparing database for data output
            //
            // The instructions below are optional, but they make the
            // data saving process more convenient
            //
            // You can create views on the main database that automatically
            // save to the database at periodic intervals.
            /////////////////////////////////////////////////

            // Creates a view for items in the ultimatum stage (all steps).
            // We will use it to save items after each ultimatum round.
            memory.view('ultimatum', function() {
                return node.game.isStage('ultimatum');
            });

            // Update the Payoffs.
            node.on.done(function(msg) {
                let data = msg.data;
                let partner = data.partner;

                // Bidder made an offer.
                if (data.role === 'BIDDER' && node.game.isStep('bidder')) {
                    // Tell the partner about the offer.
                    node.say('BID', partner, data.offer);

                    // Tag in the memory database the last added item,
                    // for easy retrieval in the next step.
                    memory.tag('offer');
                }

                // Responder replied.
                else if (data.role === 'RESPONDER' &&
                         node.game.isStep('responder')) {

                    // The the partner about the response.
                    node.say('RESPONSE', partner, data.response);

                    // If Responder accepted offer, update earnings
                    if (data.response === 'accepted') {

                        // Resolve database item with offer from bidder.
                        let offer = memory.resolveTag('offer');

                        if (offer) {
                            offer = offer.offer;
                            // Update earnings counts, so that it can be saved
                            // with GameRoom.computeBonus.
                            gameRoom.updateWin(partner, settings.COINS - offer);
                            gameRoom.updateWin(msg.from, offer);
                        }

                    }
                }
            });
        }

    });

    stager.extendStep('bidder', {
        ////////////////////////////////////
        // nodeGame hint: the matcher object
        //
        // The matcher step-property is read by the `MatcherManager` object
        // at `node.game.matcher`. This object takes care of matching together
        // players in pairs and/or to assign them a role.
        // //////////////////////////////////////////////
        matcher: {
            roles: [ 'BIDDER', 'RESPONDER', 'SOLO' ],
            match: 'roundrobin', // or 'random_pairs'
            cycle: 'repeat_invert' // or 'repeat', 'mirror', 'mirror_invert'
        }
    });

    ////////////////////////////////////////////
    // nodeGame hint: save ultimatum round data
    //
    // Save the data at the exit function
    ////////////////////////////////////////////////////////
    stager.extendStep('responder', {
        // It means that clients keep the roles and partner currently in use.
        matcher: true,
        // This callback is executed when a client reconnect.
        reconnect: function(p, opts) {

            let role = opts.plot.role;

            // Reconneting client has role RESPONDER
            // and not yet DONE (must take decision).
            if (role === 'RESPONDER' && !opts.willBeDone) {

                // Get last offer from bidder.
                let offer = memory.resolveTag('offer');
                // Equivalent to:
                // offer = memory
                //      .stage[node.game.getPreviousStep()]
                //      .select('player', '=', opts.plot.partner).first();

                // It may be undefined if, for instance, the bidder also
                // disconnected in the previous round.
                if (offer) {
                    opts.offer = offer.offer;
                    // This callback is executed on the reconnecting client
                    // and it receives the opts object as input
                    opts.cb = function(options) {
                        // `this` is node.game in the reconnecting client.
                        this.offerReceived = options.offer;
                    };
                }
            }
        },
        // The `exit` callback is executed after a step is finished.
        exit: function() {
            memory.ultimatum.save('ultimatum.csv', {
                // Specify header in advance.
                header: [
                    "session", "player", "stage.round",
                    "role", "partner", "offer", "response"
                ],
                flatten: true,            // Merge items together.
                flattenByGroup: 'player', // One row per player every round.
                updatesOnly: true         // Adds updates to same file.
            });
        }
    });

    ////////////////////////////////////////////////////
    // nodeGame hint: remove the default step-properties
    //
    // In this step `minPlayers` is no longer needed, as each
    // player can finish the questionnaire at his/her own pace.
    ///////////////////////////////////////////////////////////
    stager.extendStep('questionnaire', {
        minPlayers: undefined
    });

    stager.extendStep('endgame', {
        init: function() {

            // Feedback.
            memory.view('feedback').stream({
                header: [ 'timestamp', 'player', 'feedback' ],
                format: 'csv'
            });

            // Email.
            memory.view('email').stream({
                header: [ 'timestamp', 'player', 'email' ],
                format: 'csv'
            });
        },
        cb: function endgame() {

            // Saves bonus file, and notifies players of earnings.

            gameRoom.computeBonus();

            // Dump all memory.
            // memory.save('memory_all.json');

            // Save times of all stages.
            memory.done.save('times.csv', {
                header: [
                    'session', 'player', 'stage', 'step', 'round',
                    'time', 'timeup'
                ]
            });

        },
        // Remove contraints on minimum players.
        minPlayers: undefined
    });
};
