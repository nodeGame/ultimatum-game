/**
 * # Stages of the Ultimatum Game
 * Copyright(c) 2020 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = function(stager, settings) {

    stager
        .next('demo')
        .next('quiz')
        .next('selectLanguage')
        .next('instructions')
        .next('mood')
        .repeat('ultimatum', settings.REPEAT)
        .next('questionnaire')
        .next('endgame')
        .gameover();

    // Divide stage ultimatum in steps.

    stager.extendStage('ultimatum', {
        steps: [
            'bidder',
            'responder'
        ]
    });

    // Can skip specific stages or steps here.

    stager.skip('selectLanguage');
    stager.skip('quiz');
    stager.skip('instructions');
    // stager.skip('mood');
    // stager.skip('ultimatum');
    // stager.skip('endgame');

    // To skip a specific step:
    // stager.skip('ultimatum', 'responder');
};
