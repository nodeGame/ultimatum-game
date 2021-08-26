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
        // Call the original init function, if found.
        let origInit = node.game.getProperty('origInit');
        if (origInit) origInit.call(this);

        // Auto play, depedending on the step.
        node.on('PLAYING', function() {
            var id = node.game.getStepId();
            node.timer.setTimeout(function() {
                // Widget steps.
                if (id === 'quiz' ||
                    id === 'questionnaire' ||
                    id === 'mood') {

                    node.widgets.lastAppended.setValues({ correct: true });
                }

                // Invoking timeup in decision stages.
                else if ((node.game.role === 'BIDDER' && id === 'bidder') ||
                        (node.game.role === 'RESPONDER' &&
                        id === 'responder')) {

                    node.timer.random.timeup();
                }

                // Call done in other stages, exept the last one.
                if (id !== 'endgame') {
                    node.timer.random(2000).done();
                }

            }, 2000);
        });

    });

    game.plot = stager.getState();
    return game;
};
