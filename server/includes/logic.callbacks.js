/**
 * # Functions used by the client of Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var GameStage = ngc.GameStage;
var J = ngc.JSUS;
var path = require('path');

var DUMP_DIR, DUMP_DIR_JSON, DUMP_DIR_CSV;

module.exports = {
    init: init,
    gameover: gameover,
    doMatch: doMatch,
    endgame: endgame,
    notEnoughPlayers: notEnoughPlayers
};

var node = module.parent.exports.node;
var channel = module.parent.exports.channel;
var gameRoom = module.parent.exports.gameRoom;
var settings = module.parent.exports.settings;
var dk = module.parent.exports.dk;
var client = module.parent.exports.client;
var counter = module.parent.exports.counter;

function init() {
    DUMP_DIR = path.resolve(channel.resolveGameDir('ultimatum'), 'data') + '/' +
     counter + '/';
    DUMP_DIR_JSON = DUMP_DIR + 'json/';
    DUMP_DIR_CSV = DUMP_DIR + 'csv/';

    node.on.data('Error', function(msg) {
        console.log(node.nodename, msg.data);
    });

    // Recursively create directories, sub-trees and all.
    J.mkdirSyncRecursive(DUMP_DIR_JSON, 0777);
    J.mkdirSyncRecursive(DUMP_DIR_CSV, 0777);

    console.log('********************** ultimatum room ' + counter++ +
     ' **********************');

    var COINS = settings.COINS;

    node.game.lastStage = node.game.getCurrentGameStage();

    node.game.gameTerminated = false;

    // If players disconnects and then re-connects within the same round
    // we need to take into account only the final bids within that round.
    node.game.lastBids = {};

    // "STEPPING" is the last event emitted before the stage is updated.
    node.on('STEPPING', function() {
        var currentStage, db, p, gain;

        currentStage = node.game.getCurrentGameStage();

        // We do not save stage 0.0.0.
        // Morever, If the last stage is equal to the current one, we are
        // re-playing the same stage cause of a reconnection. In this
        // case we do not update the database, or save files.
        if (!GameStage.compare(currentStage, new GameStage())) {// ||
            //!GameStage.compare(currentStage, node.game.lastStage)) {
            return;
        }
        // Update last stage reference.
        node.game.lastStage = currentStage;

        for (p in node.game.lastBids) {
            if (node.game.lastBids.hasOwnProperty(p)) {

                // Respondent payoff.
                code = dk.codes.id.get(p);
                if (!code) {
                    console.log('AAAH code not found!');
                    return;
                }
                gain = node.game.lastBids[p];
                if (gain) {
                    code.win = !code.win ? gain : code.win + gain;
                    console.log('Added to ' + p + ' ' + gain + ' ECU');
                }
            }
        }

        db = node.game.memory.stage[currentStage];

        if (db && db.size()) {
            // Saving results to FS.
            node.fs.saveMemory('csv', DUMP_DIR + 'memory_' + currentStage +
                               '.csv', { flags: 'w' }, db);
            node.fs.saveMemory('json', DUMP_DIR + 'memory_' + currentStage +
                               '.nddb', null, db);

            console.log('Round data saved ', currentStage);
        }

        // Resets last bids;
        node.game.lastBids = {};
    });

    // Add session name to data in DB.
    node.game.memory.on('insert', function(o) {
        o.session = node.nodename;
    });

    // Register player disconnection, and wait for him...
    node.on.pdisconnect(function(p) {

        delete node.game.memory.stage[node.game.getCurrentGameStage()];

        dk.updateCode(p.id, {
            disconnected: true,
            stage: p.stage
        });
    });

    // Player reconnecting.
    // Reconnections must be handled by the game developer.
    node.on.preconnect(function(p) {
        var code;

        console.log('Oh...somebody reconnected!', p);
        code = dk.codeExists(p.id);

        if (!code) {
            console.log('game.logic: reconnecting player not found in ' +
                        'code db: ' + p.id);
            return;
        }
        if (!code.disconnected) {
            console.log('game.logic: reconnecting player that was not ' +
                        'marked disconnected: ' + p.id);
            return;
        }

        // Mark code as connected.
        code.disconnected = false;

        // Delete countdown to terminate the game.
        clearTimeout(this.countdown);

        // Clear any message in the buffer from.
        node.remoteCommand('erase_buffer', 'ROOM');

        // Notify other player he is back.
        // TODO: add it automatically if we return TRUE? It must be done
        // both in the alias and the real event handler
        node.game.pl.each(function(player) {
            node.socket.send(node.msg.create({
                target: 'PCONNECT',
                data: {id: p.id},
                to: player.id
            }));
        });

        // Send currently connected players to reconnecting one.
        node.socket.send(node.msg.create({
            target: 'PLIST',
            data: node.game.pl.fetchSubObj('id'),
            to: p.id
        }));

        // We could slice the game plot, and send just what we need
        // however here we resend all the stages, and move their game plot.
        console.log('** Player reconnected: ' + p.id + ' **');
        // Setting metadata, settings, and plot.
        node.remoteSetup('game_metadata',  p.id, client.metadata);
        node.remoteSetup('game_settings', p.id, client.settings);
        node.remoteSetup('plot', p.id, client.plot);
        node.remoteSetup('env', p.id, client.env);

        // Start the game on the reconnecting client.
        // Need to give step: false, because otherwise pre-caching will
        // call done() on reconnecting stage.
        node.remoteCommand('start', p.id, { step: false } );

        // Pause the game on the reconnecting client, will be resumed later.
        // node.remoteCommand('pause', p.id);

        // It is not added automatically.
        // TODO: add it automatically if we return TRUE? It must be done
        // both in the alias and the real event handler.
        node.game.pl.add(p);

        // Will send all the players to current stage
        // (also those who were there already).
        node.game.gotoStep(node.player.stage);

        setTimeout(function() {
            // Pause the game on the reconnecting client, will be resumed later.
            // node.remoteCommand('pause', p.id);
            // Unpause ALL players
            // TODO: add it automatically if we return TRUE? It must be done
            // both in the alias and the real event handler
            node.game.pl.each(function(player) {
                if (player.id !== p.id) {
                    node.remoteCommand('resume', player.id);
                }
            });
            // The logic is also reset to the same game stage.
        }, 100);
        // Unpause ALL players
        // node.remoteCommand('resume', 'ALL');
    });

    // Update the Payoffs
    node.on.data('response', function(msg) {
        var resWin, bidWin, code, response;
        response = msg.data;

        if (!response) {
            // TODO handle error.
            return;
        }

        if (response.response === 'ACCEPT') {
            resWin = parseInt(response.value, 10);
            bidWin = COINS - resWin;

            // Save the results in a temporary variables. If the round
            // finishes without a disconnection we will add them to the
            // database.
            node.game.lastBids[msg.from] = resWin;
            node.game.lastBids[response.from] = bidWin;
        }
    });

    console.log('init');
}

function gameover() {
    console.log('************** GAMEOVER ' + gameRoom.name +
    ' ****************');

    // Saving all indexes.
    node.fs.saveMemoryIndexes('csv', DUMP_DIR_CSV);
    node.fs.saveMemoryIndexes('json', DUMP_DIR_JSON);

    // Dump all memory.
    node.fs.saveMemory('json', DUMP_DIR + 'memory_all.json');

    // TODO: update database.
    channel.destroyGameRoom(gameRoom.name);
}

function doMatch() {
    var g, i, bidder, respondent, data_b, data_r;

    if (node.game.pl.size() < 2) {
        if (!this.countdown) notEnoughPlayers();
        return;
    }

    // Method shuffle accepts one parameter to update the db, as well as
    // returning a shuffled copy.
    g = node.game.pl.shuffle();

    for (i = 0 ; i < node.game.pl.size() ; i = i + 2) {
        bidder = g.db[i];
        respondent = g.db[i+1];

        data_b = {
            role: 'bidder',
            other: respondent.id
        };
        data_r = {
            role: 'respondent',
            other: bidder.id
        };

        console.log('Group ' + i + ': ', bidder.id, respondent.id);

        // Send a message to each player with their role
        // and the id of the other player.
        console.log('==================== LOGIC: BIDDER is', bidder.id,
                    '; RESPONDENT IS', respondent.id);
        node.say('BIDDER', bidder.id, data_b);
        node.say('RESPONDENT', respondent.id, data_r);
    }
    console.log('Matching completed.');
}

function notEnoughPlayers() {
    if (this.countdown) return;
    console.log('Warning: not enough players!!');
    this.countdown = setTimeout(function() {
        console.log('Countdown fired. Going to Step: questionnaire.');
        node.remoteCommand('erase_buffer', 'ROOM');
        node.remoteCommand('resume', 'ROOM');
        node.game.gameTerminated = true;
        // if syncStepping = false
        //node.remoteCommand('goto_step', 5);
        node.game.gotoStep('questionnaire');
    }, 30000);
}

function endgame() {
    var code, exitcode, accesscode;
    var bonusFile, bonus;
    var EXCHANGE_RATE;

    console.log('Endgame');

    EXCHANGE_RATE = settings.EXCHANGE_RATE;


    bonusFile = DUMP_DIR + 'bonus.csv';

    console.log('FINAL PAYOFF PER PLAYER');
    console.log('***********************');

    bonus = node.game.pl.map(function(p) {

        code = dk.codes.id.get(p.id);
        if (!code) {
            console.log('ERROR: no code in endgame:', p.id);
            return ['NA', 'NA'];
        }

        accesscode = code.AccessCode;
        exitcode = code.ExitCode;

        if (node.env('treatment') === 'pp' && node.game.gameTerminated) {
            code.win = 0;
        }
        else {
            code.win = Number((code.win || 0) / EXCHANGE_RATE).toFixed(2);
            code.win = parseFloat(code.win, 10);
        }
        dk.checkOut(accesscode, exitcode, code.win);

        node.say('WIN', p.id, {
            win: code.win,
            exitcode: code.ExitCode
        });

        console.log(p.id, ': ',  code.win, code.ExitCode);
        return [p.id, code.ExitCode, code.win, node.game.gameTerminated];
    });

    console.log('***********************');
    console.log('Game ended');

    node.fs.writeCsv(bonusFile, bonus, {
        headers: ["access", "exit", "bonus", "terminated"]
    });

    node.done();
}
