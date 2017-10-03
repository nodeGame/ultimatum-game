module.exports = function(settings, headers) {
    var s, coins;

    // Retro-compatibility with nodeGame < 4.0.
    s = settings.pp || settings;
    coins = s.COINS;

    return {
        "title": "Anbieter",
        "youAre": "Sie sind der Anbieter",
        "makeAnOffer": "Machen Sie einem anderen Spieler ein Angebot zwischen 0 und " + coins + ".",
        "submit": "Übermitteln"
    };
}

