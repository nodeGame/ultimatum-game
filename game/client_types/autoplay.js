/**
* # Autoplay code for Ultimatum Game
* Copyright(c) 2020 Stefano Balietti
* MIT Licensed
*
* Handles automatic play.
*
* http://www.nodegame.org
*/

const ngc =  require('nodegame-client');

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    // Retrieve the player client type and rename its nodename property.
    let game = gameRoom.getClientType('player');
    game.nodename = 'autoplay';
    // Create a new stager based on the player client type.
    stager = ngc.getStager(game.plot);

    // Modyfy the new stager's init property, so that at every step
    // it performs an automatic choice, after the PLAYING even is fired.
    let origInit = stager.getOnInit();
    if (origInit) stager.setDefaultProperty('origInit', origInit);
    stager.setOnInit(function() {
        let origInit = node.game.getProperty('origInit');
        if (origInit) origInit.call(this);
        node.on('PLAYING', function() {
            let id = node.game.getCurrentStepObj().id;
            setTimeout(function() {
                // Widget steps.
                if (id === 'quiz' ||
                    id === 'questionnaire' ||
                    id === 'mood') {

                        node.widgets.lastAppended.setValues({
                            correct: true
                        });
                }

                if ((node.game.role === 'BIDDER' && id === 'bidder') ||
                        (node.game.role === 'RESPONDENT' &&
                        id === 'respondent')) {

                    node.timer.randomExec(function() {
                        node.game.timer.doTimeUp();
                    });
                }
                else if (id !== 'precache' && id !== 'endgame') {
                    node.timer.randomDone(2000);
                }

            }, 2000);
        });
    });

    game.plot = stager.getState();
    return game;
};
