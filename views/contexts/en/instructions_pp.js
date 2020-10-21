module.exports = function(settings, headers) {
    var s, C, R, E, W;

    // Retro-compatibility with nodeGame < 4.0.
    s = settings.pp || settings;

    C = s.COINS;
    R = s.REPEAT;
    E = s.EXCHANGE_RATE_INSTRUCTIONS;
    W = s.WAIT_TIME;

    return {
        title: "INSTRUCTIONS",
        instructions: "Instructions of the Ultimatum Game",
        readCarefully: "Please read them carefully.",
        thisGameIsPlayed: "This game is played in rounds by two human players randomly paired.",
        inEachRound: 'In each round, one of the them, called <em>BIDDER</em>, makes an offer to the other player, called <em>RESPONDER</em>, about how to share ' + C + ' ECU (Experimental Currency). ' + C + ' ECU are equal to ' + E + ' USD.',
        theRespondent: "The RESPONDER can either accept or reject the offer of the BIDDER. If he / she accepts, both players split " + C + " ECU accordingly, else both get 0.",
        theGameIsRepeated: "The game is repeated " + R + " rounds.",
        important: "Important. If one of the players disconnects for more than " + W + " seconds the game will be terminated.",
        inSuchACase: "In such a case the player who disconnected will not be paid at all, and the remaining ones will be paid only the show up fee.",
        ifYouUnderstood: "If you understood the instructions correctly press the DONE button to proceed to the game."
    };
};
