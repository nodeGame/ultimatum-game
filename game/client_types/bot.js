/**
 * # Bot code for Ultimatum Game
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Code for a bot playing the ultimatum game randomly.
 * 
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

// Export the game-creating function.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var game;

    var channel = gameRoom.channel;
    var logic = gameRoom.node;

    // Specify init function, and extend default stages.
    ////////////////////////////////////////////////////

    // Set the default step rule for all the stages.
    stager.setDefaultStepRule(stepRules.WAIT);

    stager.setDefaultCallback(function() {
        this.node.timer.randomDone(2000);   
    });

    stager.extendStep('bidder', {
        role: function() { return this.role; },
        roles: {
            BIDDER: {
                cb: function() {
                    var node, amount;
                    node = this.node;
                    amount = Math.floor(Math.random() * 101);
                    setTimeout(function() {
                        node.say('OFFER', node.game.partner, amount);
                        node.done({ offer: amount});
                    }, 2000);
                }
            },
            RESPONDENT: {
                cb: function() {
                    var node;
                    node = this.node;

                    node.on.data('OFFER', function(msg) {
                        node.done();
                    });
                }
            }
        }
    });

    stager.extendStep('respondent', {
        role: function() { return this.role; },
        partner: function() { return this.partner; },
        roles: {
            RESPONDENT: {
                cb: function() {
                    var node, response;
                    
                    that = this;
                    node = this.node;
                    if (Math.round(Math.random())) {
                        response = 'ACCEPT';
                    }
                    else {
                        response = 'REJECT';
                    }
                    node.say(response, node.game.partner, response);
                    node.done({
                        value: node.game.offerReceived,
                        responseTo: node.game.partner,
                        response: response
                    });
                }
            },
            BIDDER: {
                cb: function() {
                    var node;
                    node = this.node;
                    
                    node.on.data('ACCEPT', function(msg) {
                        node.info(' Your offer was accepted.');
                        node.done();
                    });
                    node.on.data('REJECT', function(msg) {
                        node.info(' Your offer was rejected.');
                        node.done();
                    });
                }
            }
        }
    });

    // Prepare the game object to return.
    /////////////////////////////////////

    game = {};

    // We serialize the game sequence before sending it.
    game.plot = stager.getState();
    game.nodename = 'bot';

    return game;
};
