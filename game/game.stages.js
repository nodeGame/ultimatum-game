/**
 * # Stages of the Ultimatum Game
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = function(stager, settings) {

    stager
        .next('precache')
        .next('selectLanguage')
        .next('instructions')
        .next('quiz')
        .next('mood')
        .repeat('ultimatum', settings.REPEAT)
        .next('questionnaire')
        .next('endgame')
        .gameover();

    // Divide stage ultimatum in steps.

    stager.extendStage('ultimatum', {
        steps: [
            'bidder',
            'respondent'
        ]
    });

    // Can skip specific stages or steps here.

    // stager.skip('precache');
    // stager.skip('selectLanguage');
    // stager.skip('quiz');
    // stager.skip('instructions');
    // stager.skip('mood');
    // stager.skip('ultimatum');
    // stager.skip('endgame');
};
