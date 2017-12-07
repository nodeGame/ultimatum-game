/**
 * # Bot code for Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Code for a bot playing the ultimatum game randomly.
 *
 * TODO: Update code!
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

    // TODO: check if stager should be recreated as in autoplay.

    // Specify init function, and extend default stages.
    ////////////////////////////////////////////////////

    stager.setOnInit(function() {
        var that, node;
        
        that = this;
        node = this.node;

        this.other = null;
    });

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
                    var node;
                    node = this.node;
                    setTimeout(function() {
                        node.emit('BID_DONE', Math.floor(Math.random() * 101));
                    }, 2000);
                }
            },
            RESPONDENT: {
                cb: function() {
                    node.on.data('OFFER', function(msg) {
                        node.done();
                    });
                }
            }
        }
    });

    stager.extendStep('respondent', {
        role: function() { return this.role; },
        roles: {
            RESPONDENT: {
                cb: function() {
                    var node, option;
                    
                    that = this;
                    node = this.node;
                    if (Math.round(Math.random())) {
                        option = 'ACCEPT';
                    }
                    else {
                        option = 'REJECT';
                    }
                    node.emit('RESPONSE_DONE', option);
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
