/**
 * # Bot code for Ultimatum Game
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Code for a bot playing the ultimatum game randomly.
 *
 * http://www.nodegame.org
 */

const ngc = require('nodegame-client');
const stepRules = ngc.stepRules;

// Export the game-creating function.
module.exports = function(treatmentName, settings, stager,
                          setup, gameRoom, node) {

    let channel = gameRoom.channel;
    // Important! This is the logic, and not the bot.
    let logic = gameRoom.node;

    // Specify init function, and extend default stages.
    ////////////////////////////////////////////////////

    // Set the default step rule for all the stages.
    stager.setDefaultStepRule(stepRules.WAIT);

    stager.setDefaultCallback(function() {
        // Randomly executes node.done between 1 (default) and 3 seconds.
        node.timer.random(3000).done();
    });

    stager.extendStep('bidder', {
        role: function() { return this.role; },
        roles: {
            BIDDER: {
                cb: function() {
                    let amount = Math.floor(Math.random() * 101);
                    node.timer.setTimeout(function() {
                        // Randomly executes node.done between 2 and 4 seconds.
                        node.timer.random(1000).done({ offer: amount});
                    }, 2000);
                }
            },
            RESPONDER: {
                init: function() {
                    node.game.offerReceived = null;
                },
                cb: function() {
                    node.on.data('BID', (msg) => {
                        node.game.offerReceived = msg.data;
                        node.done();
                    });
                }
            }
        }
    });

    stager.extendStep('responder', {
        role: function() { return this.role; },
        partner: function() { return this.partner; },
        roles: {
            RESPONDER: {
                cb: () => {
                    let response = Math.random() > 0.5 ?
                        'accepted' : 'rejected';

                    node.timer.random(4000).done({
                        response: response
                    });
                }
            },
            BIDDER: {
                cb: () => {
                    node.on.data('RESPONSE', (msg) => {
                        node.info(' Your offer was ' + msg.data + '.');
                        node.timer.random(1000).done();
                    });
                }
            }
        }
    });

    // Return the game object.
    //////////////////////////

    return {
        // We serialize the game sequence before sending it.
        plot: stager.getState(),
        nodename: 'bot'
    };
};
