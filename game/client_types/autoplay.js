/**
 * # Autoplay code for Ultimatum Game
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Handles automatic play.
 *
 * http://www.nodegame.org
 */

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var ngc =  require('nodegame-client');

    var game, stager;

    game = gameRoom.getClientType('player');
    game.nodename = 'autoplay';

    stager = ngc.getStager(game.plot);

    stager.extendAllSteps(function(o) {
        var role;
        if (o.roles) {
            o._roles = {};
            for (role in o.roles) {
                if (o.roles.hasOwnProperty(role)) {
                    // Copy only cb property.
                    o._roles[role] = o.roles[role].cb;
                    // Make a new one.
                    o.roles[role].cb = function() {
                        var _cb, stepObj, id;
                        stepObj = this.getCurrentStepObj();
                        id = stepObj.id

                        _cb = stepObj._roles[this.role];
                        _cb.call(this);

                        if ((this.role === 'BIDDER' && id === 'bidder') ||
                            (this.role === 'RESPONDENT' &&
                             id === 'respondent')) {

                            node.on('PLAYING', function() {
                                node.timer.randomExec(function() {
                                    node.game.timer.doTimeUp();
                                });
                            });
                        }
                    }
                }
            }
        }
        else {
            o._cb = o.cb;
            o.cb = function() {
                var _cb, stepObj, id;
                stepObj = this.getCurrentStepObj();
                id = stepObj.id

                _cb = stepObj._cb;
                _cb.call(this);
                
                if (id === 'quiz' ||
                    id === 'questionnaire' || 
                    id === 'mood') {
                    
                    node.on('PLAYING', function() {
                        node.timer.randomExec(function() {
                            node.game.timer.doTimeUp();
                        });
                    });
                }
                else if (id !== 'precache' && id !== 'endgame') {
                    node.timer.randomDone(2000);
                }
            };
        }
        return o;
    });

    game.plot = stager.getState();
    return game;
};
