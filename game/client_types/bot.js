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
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    let channel = gameRoom.channel;
    // Important! This is the logic, and not the bot.
    let logic = gameRoom.node;
    // The node instance is available only in the init method.
    let node;

    // Specify init function, and extend default stages.
    ////////////////////////////////////////////////////

    // Set the default step rule for all the stages.
    stager.setDefaultStepRule(stepRules.WAIT);

    // Store global node reference.
    stager.setOnInit(function() {
        node = this.node;
    });

    stager.setDefaultCallback(function() {
        node.timer.randomDone(2000);
    });

    stager.extendStep('bidder', {
        role: function() { return this.role; },
        roles: {
            BIDDER: {
                cb: function() {
                    let amount = Math.floor(Math.random() * 101);
                    setTimeout(function() {
                        node.say('OFFER', node.game.partner, amount);
                        node.done({ offer: amount});
                    }, 2000);
                }
            },
            RESPONDENT: {
                cb: function() {
                    node.on.data('OFFER', (msg) => {
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
                cb: () => {
                    let response = Math.random() > 0.5 ?
                        'accepted' : 'rejected';

                    node.say('RESPONSE', node.game.partner, response);
                    node.done({
                        value: node.game.offerReceived,
                        responseTo: node.game.partner,
                        response: response
                    });
                }
            },
            BIDDER: {
                cb: () => {
                    node.on.data('RESPONSE', (msg) => {
                        node.info(' Your offer was ' + msg.data + '.');
                        node.done();
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
