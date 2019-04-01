/**
 * # Functions used by the logic of Ultimatum Game
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var GameStage = ngc.GameStage;
var J = ngc.JSUS;
var path = require('path');
var fs = require('fs-extra');

module.exports = {
    init: init,
    endgame: endgame,
    notEnoughPlayers: notEnoughPlayers,
    reconnectUltimatum: reconnectUltimatum
};

var node = module.parent.exports.node;
var channel = module.parent.exports.channel;
var gameRoom = module.parent.exports.gameRoom;
var settings = module.parent.exports.settings;

function init() {

    console.log('********************** ultimatum ' + gameRoom.name +
                ' *********************');

    this.lastStage = this.getCurrentGameStage();

    // If players disconnects and then re-connects within the same round
    // we need to take into account only the final bids within that round.
    this.lastBids = {};

    // "STEPPING" is the last event emitted before the stage is updated.
    node.on('STEPPING', function() {
        var currentStage, db, p, gain, prefix;
        var client;

        currentStage = node.game.getCurrentGameStage();

        // Update last stage reference.
        node.game.lastStage = currentStage;

        for (p in node.game.lastBids) {
            if (node.game.lastBids.hasOwnProperty(p)) {

                // Respondent payoff.
                client = channel.registry.getClient(p);

                gain = node.game.lastBids[p];
                if (gain) {
                    client.win = !client.win ? gain : client.win + gain;
                    console.log('Added to ' + p + ' ' + gain + ' ECU');
                }
            }
        }

        db = node.game.memory.stage[currentStage];

        if (db && db.size()) {
            prefix = gameRoom.dataDir + 'memory_' + currentStage;
            db.save(prefix + '.csv', { flags: 'w' });
            db.save(prefix + '.nddb', { flags: 'w' });

            console.log('Round data saved ', currentStage);
        }

        // Resets last bids;
        node.game.lastBids = {};
    });

    // Add session name to data in DB.
    this.memory.on('insert', function(o) {
        o.session = node.nodename;
    });

    // Update the Payoffs
    node.on.data('done', function(msg) {
        var resWin, bidWin, response;
        if (msg.data && msg.data.response === 'ACCEPT') {
            response = msg.data;
            resWin = parseInt(response.value, 10);
            bidWin = settings.COINS - resWin;

            // Save the results in a temporary variables. If the round
            // finishes without a disconnection we will add them to the .
            node.game.lastBids[msg.from] = resWin;
            node.game.lastBids[response.responseTo] = bidWin;
        }
    });

    // Logging errors from remote clients to console.
    node.on('in.say.LOG', function(msg) {
        if (msg.text === 'error' && msg.stage.stage) {
            console.log('Error from client: ', msg.from);
            console.log('Error msg: ', msg.data);
        }
    });

    console.log('init');
}

function endgame() {

    console.log('FINAL PAYOFF PER PLAYER');
    console.log('***********************');

    gameRoom.computeBonus({
        say: true,   // default false
        dump: true,  // default false
        print: true  // default false
        // Optional. Pre-process the results of each player.
        // cb: function(info, player) {
        // // The sum of partial results is diplayed before the total.
        //         info.partials = [ 10, -1, 7];
        // }
    });

    // Dump all memory.
    node.game.memory.save('memory_all.json');
}


function notEnoughPlayers() {
    node.game.gotoStep('questionnaire');
}

function reconnectUltimatum(p, reconOptions) {
    var offer, setup, other, role, bidder;

    // Get old setup for re-connecting player.
    setup = node.game.matcher.getSetupFor(p.id);

    other = setup.partner;
    role = setup.role;

    if (!reconOptions.plot) reconOptions.plot = {};
    reconOptions.role = role;
    reconOptions.other = other;

    if (node.player.stage.step === 3 && role !== 'SOLO') {
        bidder = role === 'RESPONDENT' ? other : p.id;
        offer = node.game.memory.stage[node.game.getPreviousStep()]
            .select('player', '=', bidder).first();
        if (!offer || 'number' !== typeof offer.offer) {
            // Set it to zero for now.
            node.err('ReconnectUltimatum: could not find offer for: ' + p.id);
            offer = 0;
        }
        else {
            offer = offer.offer;
        }

        // Store reference to last offer in game.
        reconOptions.offer = offer;
    }

    // Respondent on respondent stage must get back offer.
    if (role === 'RESPONDENT') {
        reconOptions.cb = function(options) {
            this.plot.tmpCache('frame', 'resp.html');
            this.role = options.role;
            this.other = options.other;
            this.offerReceived = options.offer;
        };
    }

    else if (role === 'BIDDER') {
        reconOptions.cb = function(options) {
            this.plot.tmpCache('frame', 'bidder.html');
            this.role = options.role;
            this.other = options.other;
            if (this.node.player.stage.step === 3) {
                this.lastOffer = options.offer;
                this.node.on('LOADED', function() {
                    node.done(options.lastOffer);
                });
            }
        };
    }

    else if (role === 'SOLO') {
        reconOptions.cb = function(options) {
            this.plot.tmpCache('frame', 'solo.html');
            this.role = options.role;
        };
    }
}
