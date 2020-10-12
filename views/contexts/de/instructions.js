module.exports = function(settings, headers) {
    var s, C, R, E, W;

    // Retro-compatibility with nodeGame < 4.0.
    s = settings.pp || settings;

    C = s.COINS;
    R = s.REPEAT;
    E = s.EXCHANGE_RATE_INSTRUCTIONS;
    W = s.WAIT_TIME;

    return {
        title: "INSTRUKTIONEN",
        instructions: "Anleitung zum Ultimatum Spiel.",
        readCarefully: "Bitte sorgfältig lesen.",
        thisGame: "Dieses Spiel wird in Runden von zwei zufällig gepaarten menschlichen Spielern gespielt.",
        inEachRound: "In jeder Runde macht einer von ihnen, <em>BIDDER</em> genannt, dem anderen Spieler, <em>RESPONDER</em>, ein Angebot, wie man " + C + " ECU (experimentelle Währung) teilt. " + C + " ECU entspricht " + E + " USD.",
        theRespondent: "Der RESPONDER kann das Angebot des BIDDER entweder annehmen oder ablehnen. Wenn er / sie annimmt, teilen beide Spieler " + C + " ECU entsprechend auf, andernfalls erhalten beide 0.",
        theGame: "Das Spiel wird wiederholt " + R + " Runden.",
        ifYouUnderstood: "Wenn Sie die Anweisungen richtig verstanden haben, drücken Sie die Taste, um mit dem Spiel fortzufahren."
    };
};
