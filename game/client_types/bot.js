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

        node.on('BID_DONE', function(value, notify) {
            var root, time, offer, submitOffer, timeup;        

            timeup = node.game.timer.isTimeup();

            // Save references.
            node.game.lastOffer = value;
            node.game.lastTimup = timeup;
            node.game.lastTime = time;

            if (notify !== false) {
                // Notify the other player.
                node.say('OFFER', node.game.partner, node.game.lastOffer);

                // Notify the server.
                node.done({ offer: value });
            }

        });

        node.on('RESPONSE_DONE', function(response) {

            // Tell the other player own response.
            node.say(response, node.game.partner, response);
            node.done({
                value: node.game.offerReceived,
                responseTo: node.game.partner,
                response: response
            });
        });
        
        this.randomAccept = function(offer, other) {
            var res;
            res = Math.round(Math.random()) > 0.5 ? 'ACCEPT' : 'REJECT';
            node.emit('RESPONSE_DONE', res, offer, other);
        };
    });

    stager.extendStep('ultimatum', {
        roles: {
            BIDDER: function() {
    	        var that, node, other;

            	that = this;
            	node = this.node;


            	node.info('Ultimatum');
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
