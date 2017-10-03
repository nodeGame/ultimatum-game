module.exports = function(settings, headers) {
    var s, coins;

    // Retro-compatibility with nodeGame < 4.0.
    s = settings.pp || settings;

    coins = s.COINS;

    return {
        "title": "Bidder",
        "youAre": "You are the Bidder",
        "makeAnOffer": "Make an offer from 0 to " + coins + " to another player.",
        "submit": "Submit"
    };
};
