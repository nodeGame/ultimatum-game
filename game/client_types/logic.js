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

    // Event handler registered in the init function are always valid.
    stager.setOnInit(function() {

        // Add session name to data in DB.
        this.memory.on('insert', function(o) {
            o.session = node.nodename;
            let role = node.game.matcher.getRoleFor(o.player);
            if (role) o.role = role;
        });

        console.log('init');
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

    stager.extendStep('bidder', {
        ////////////////////////////////////
        // nodeGame hint: the matcher object
        //
        // The matcher step-property is read by the `MatcherManager` object
        // at `node.game.matcher`. This object takes care of matching together
        // players in pairs and/or to assign them a role.
        // //////////////////////////////////////////////
        matcher: {
            roles: [ 'BIDDER', 'RESPONDENT', 'SOLO' ],
            match: 'roundrobin', // or 'random_pairs'
            cycle: 'repeat_invert', // or 'repeat', 'mirror', 'mirror_invert'
            // skipBye: false,
            // setPartner: true,
        }
    });

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
            node.game.memory.view('ultimatum', function(item) {
                return node.game.isStage('ultimatum');
            });


            // Update the Payoffs.
            node.on.data('done', function(msg) {
                var resWin, bidWin, response, bidder, responder;

                // If Respondent accepted offer, update earnings.
                if (msg.data && msg.data.response === 'accepted') {
                    response = msg.data;

                    resWin = response.offer;
                    bidWin = settings.COINS - resWin;

                    bidder = channel.registry.getClient(response.responseTo);
                    bidder.win += bidWin;
                    console.log('Added to', bidder.id, bidWin, 'ECU');

                    responder = channel.registry.getClient(msg.from);
                    responder.win += resWin;
                    console.log('Added to', responder.id, resWin, 'ECU');
                }
            });
        },

        reconnect: function(p, opts) {
            var offer, partner, role;

            role = opts.plot.role;
            partner = opts.plot.partner;

            // Reconneting client has role RESPONDENT, in step 'respondent',
            // and it is not DONE (must take decision).
            if (role === 'RESPONDENT' &&
                node.game.isStep(2) &&
                !opts.willBeDone) {

                offer = node.game.memory
                    .stage[node.game.getPreviousStep()]
                    .select('player', '=', partner).first();

                // It may be undefined if, for instance, the bidder also
                // disconnected in the previous round.
                if (offer) {
                    opts.offer = offer.offer;
                    opts.cb = function(options) {
                        this.offerReceived = options.offer;
                    };
                }
            }
        }

    });

    ////////////////////////////////////////////
    // nodeGame hint: save ultimatum round data
    //
    // Save the data at the exit function
    ////////////////////////////////////////////////////////
    stager.extendStep('respondent', {
        exit: function() {
            node.game.memory.ultimatum.save('ultimatum.csv', {
                // Specify headers in advance.
                headers: [
                    "session", "player", "stage.round", "role", "offer",
                    "response", "timeup", "time_1.1.1", "time_1.2.1",
                    "time_1.1.2", "time_1.2.2"
                ],
                flatten: true,            // Merge items together.
                flattenByGroup: 'player',  // One row per player every round.
                incremental: true,        // Adds updates to same file.
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
            node.game.memory.view('feedback').save('feedback.csv', {
                headers: [ 'time', 'timestamp', 'player', 'feedback' ],
                recurrent: true,
                recurrentInterval: 50000
            });

            // Email.
            node.game.memory.view('email').save('email.csv', {
                headers: [ 'timestamp', 'player', 'email' ],
                recurrent: true,
                recurrentInterval: 50000
            });
        },
        cb: function endgame() {
            console.log('FINAL PAYOFF PER PLAYER');
            console.log('***********************');

            gameRoom.computeBonus({
                say: true,   // default false
                dump: true,  // default false
                print: true,  // default false
                addDisconnected: true, // default false
                amt: true, // default false (auto-detect)

                // Optional. Pre-process the results of each player.
                // cb: function(info, player) {
                // // The sum of partial results is diplayed before the total.
                //         info.partials = [ 10, -1, 7];
                // }
            });

            // Dump all memory.
            node.game.memory.save('memory_all.json');
        },
        minPlayers: undefined
    });
};
