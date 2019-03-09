/**
 * # Game settings: Ultimatum Game
 * Copyright(c) 2019 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * http://www.nodegame.org
 */

module.exports = {

    // Minimum number of players that must be always connected.
    MIN_PLAYERS: 2,

    // Number or rounds to repeat the bidding. *
    REPEAT: 2,

    // Number of coins to split. *
    COINS: 100,

    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: (1/2000),

    EXCHANGE_RATE_INSTRUCTIONS: 0.01,

    // TIMER.
    // If the name of a key of the TIMER object matches the name of one
    // of the steps or stages, its value is automatically used as the
    // value of the `timer` property of that step/stage.
    //
    // The timer property is read by `node.game.timer` and by VisualTimer
    // widgets, if created. It can be:
    //
    //  - a number (in milliseconds),
    //  - a function returning the number of milliseconds,
    //  - an object containing properties _milliseconds_, and _timeup_
    //      the latter being the name of an event to emit or a function
    //      to execute when the timer expires. If _timeup_ is not set,
    //      property _timeup_ of the game step will be used.
    TIMER: {
        selectLanguage: 30000,
        instructions: 90000,
        quiz: 60000,
        mood: 60000,
        questionnaire: 90000,
        bidder: 30000,
        respondent: 30000
    },

    // Available treatments:
    // (there is also the "standard" treatment, using the options above)
    treatments: {

        standard: {
            description: "More time to wait and no peer pressure.",
            WAIT_TIME: 20,
            instructionsPage: 'instructions.html'
        },

        pp: {
            description:
                "Introduces peer pressure to players to not disconnect.",
            WAIT_TIME: 10,
            instructionsPage: 'instructions_pp.html'
        }
    }


    // * =  If you change this, you need to update
    // the instructions and quiz static files in public/
};
