module.exports = function(settings, headers) {
    var s, C, R, E;

    // Retro-compatibility with nodeGame < 4.0.
    s = settings.pp || settings;

    C = settings.COINS;
    R = settings.REPEAT;
    E = settings.EXCHANGE_RATE_INSTRUCTIONS;

    return {
        title: "INSTRUCTIONS",
        instructions: "Instructions of the Ultimatum Game",
        readCarefully: "Please read them carefully.",
        thisGame: "This game is played in rounds by two human players randomly paired.",
        inEachRound: 'In each round, one of the them, called <em>BIDDER</em>, makes an offer to the other player, called <em>RESPONDER</em>, about how to share ' + C + ' ECU (Experimental Currency). ' + C + ' ECU are equal to ' + E + ' USD.',
        theRespondent: "The RESPONDER can either accept or reject the offer of the BIDDER. If he / she accepts, both players split " + C + " ECU accordingly, else both get 0.",
        theGame: "The game is repeated " + R + " rounds.",
        ifYouUnderstood: "If you understood the instructions correctly press the DONE Button to proceed to the game."
    };
};
