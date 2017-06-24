/**
 * # Functions used by the bot of Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {
    init: init,
    ultimatum: ultimatum,
};

function init() {
    var that, node;
    
    that = this;
    node = this.node;

    this.other = null;

    node.on('BID_DONE', function(offer, to) {
        node.set('offer', offer);
        node.say('OFFER', to, offer);
    });

    node.on('RESPONSE_DONE', function(response, offer, from) {
        node.info(response + ' ' + offer + ' ' + from);
        node.set('response', {
            response: response,
            value: offer,
            from: from
        });
        node.say(response, from, response);

        node.done();
    });

    this.randomAccept = function(offer, other) {
        var accepted;
        accepted = Math.round(Math.random());
        node.info('randomaccept');
        node.info(offer + ' ' + other);
        if (accepted) {
            node.emit('RESPONSE_DONE', 'ACCEPT', offer, other);
        }
        else {
            node.emit('RESPONSE_DONE', 'REJECT', offer, other);
        }
    };
}

function ultimatum() {
    var that, node, other;

    that = this;
    node = this.node;

    // Load the BIDDER interface.
    node.on.data('BIDDER', function(msg) {
        node.info('RECEIVED BIDDER!');
        other = msg.data.other;
        node.set('ROLE', 'BIDDER');
        
        setTimeout(function() {
            node.emit('BID_DONE',
                      Math.floor(Math.random() * 101),
                      other);
        }, 2000);

        node.on.data('ACCEPT', function(msg) {
            node.info(' Your offer was accepted.');
            node.done();
        });

        node.on.data('REJECT', function(msg) {
            node.info(' Your offer was rejected.');
            node.done();
        });
    });

    // Load the respondent interface.
    node.on.data('RESPONDENT', function(msg) {
        node.info('RECEIVED RESPONDENT!');
        other = msg.data.other;
        node.set('ROLE', 'RESPONDENT');

        node.on.data('OFFER', function(msg) {
            that.randomAccept(msg.data, other);
        });
    });

    node.info('Ultimatum');
}
