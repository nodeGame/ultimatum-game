var fs = require('fs');
var path = require('path');
var should = require('should');
var NDDB = require('NDDB').NDDB;

var settings = require('./settings.js');
var gameSettings = require('../game/game.settings.js');

var numPlayers = settings.numPlayers;

var dataDir;
var numGames, nRounds;
var filePaths = [];
var dbs = [];

// TODO: Assuming two players per game.
if (numPlayers % 2 != 0) {
    console.log('Invalid number of players! Check settings.js.');
    process.exit(1);
}
numGames = numPlayers / 2;
nRounds = gameSettings.REPEAT;

dataDir = path.resolve(__dirname, '../', 'data') + path.sep;

// Load all room directories.
(function(dataDir) {
    var files, file, tokens, roomNum, maxRoomNum;
    var i, len;

    maxRoomNum = 0;
  
    files = fs.readdirSync(dataDir);

    i = -1, len = files.length;
    for ( ; ++i < len ; ) {
        file = path.join(dataDir, files[i]);
        if (fs.lstatSync(file).isDirectory()) {
            filePaths.push(path.join(file, 'memory_all.json'));
        }
    }
})(dataDir);

describe(numGames + ' memory files "data/*/memory_all.json"', function() {
    it('should exist', function() {
        var gameNo;
        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            fs.existsSync(filePaths[gameNo]).should.be.true;
        }
    });

    it('should be loadable with NDDB', function() {
        var gameNo, db;
        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            db = new NDDB();
            db.loadSync(filePaths[gameNo]);
            db.size().should.be.above(0, 'Empty DB in game ' +
                                      (gameNo+1) + '/' + numGames + '!');
            dbs.push(db);
        }
    });
});

describe('File contents', function() {

    it('should have the right number of entries', function() {
        var gameNo, nSets;

        // 2 precache, 2 languageSel, 2 instr, 2 quiz, 2 quest, 2 mood = 12
        // REPEAT * ultimatum (2 + 2 = 4)
        nSets = 12 + (4 * nRounds);

        // TODO: Assuming two players.
        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            dbs[gameNo].size().should.equal(nSets,
                'Wrong number of entries in game '+(gameNo+1)+'/'+numGames+'!');
        }
    });

    it('should have consistent player IDs', function() {
        var gameNo, i;
        var group;

        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            // Assuming two players.
            group = dbs[gameNo].groupBy('player');
            group.length.should.equal(2,
                'Wrong number of players in game '+(gameNo+1)+'/'+numGames+'!');

            // Check for ID data-type.
            for (i = 0; i < 2; ++i) {
                group[i].db[0].player.should.be.String;
            }
        }
    });
});

describe('Bidding rounds', function() {
    var bidDbs = [];

    before(function() {
        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            bidDbs.push(dbs[gameNo].select('stage.stage', '=', 6).breed());
        }
    });

    it('should have the correct number of repetitions', function() {
        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            // Maximum round should equal the repetition number in the settings.
            Math.max.apply(null,
                bidDbs[gameNo].fetchValues('stage.round')['stage.round']
            ).should.equal(nRounds,
                'Wrong number of rounds in game ' + 
                           (gameNo+1) + '/'+numGames + '!');
        }
    });

    it('should have valid offers', function() {
        var i, roundDb;
        var offer, response;

        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            for (i = 1; i <= nRounds; ++i) {
                roundDb = bidDbs[gameNo].select('stage.round', '=', i).breed();

                // Get offer and response.
                offer = roundDb.select('offer').fetch()[0].offer;
                response = roundDb.select('response').fetch()[0];

                // Check value ranges.
                offer.should.be.Number;

                (offer % 1).should.equal(0, 'Offer not an integer in game '+
                    (gameNo+1)+'/'+numGames+'!');

                offer.should.be.within(0, 100, 'Offer not in [0, 100] in game '+
                    (gameNo+1)+'/'+numGames+'!');

                ['ACCEPT', 'REJECT'].should.containEql(response.response,
                    'Invalid response in game '+(gameNo+1)+'/'+numGames+'!');

                // Check offer/response correspondence.
                offer.should.equal(response.value,
                    'Response contains incorrect offer in game '+
                    (gameNo+1)+'/'+numGames+'!');
            }
        }
    });

    it('should have players in the correct roles', function() {
        var i, roundDb, tmp;
        var bidderId, confirmBidderId, respondentId, responseObj;

        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            for (i = 1; i <= nRounds; ++i) {
                roundDb = bidDbs[gameNo].select('stage.round', '=', i).breed();

                // Check role IDs.
                tmp = roundDb
                    .select('responseTo')
                    .fetch()[0];
                bidderId = tmp.responseTo;
                respondentId = tmp.player;

                confirmBidderId = roundDb
                    .select('offer')
                    .fetch()[0].player;


                bidderId.should.equal(confirmBidderId,
                    'Bidder is not saved correctly in repondent obj in game ' +
                    (gameNo+1)+'/'+numGames+'!');

                bidderId.should.not.equal(respondentId,
                    'Bidder same as respondent in game '+
                    (gameNo+1)+'/'+numGames+'!');

                // Check offer/response correspondence.
                roundDb.select('offer')
                    .fetch()[0].player.should.equal(
                        bidderId, 'Bid did not come from bidder in game '+
                        (gameNo+1)+'/'+numGames+'!');

                responseObj = roundDb.select('response').fetch()[0];
                responseObj.player.should.equal(respondentId,
                    'Response did not come from respondent in game '+
                    (gameNo+1)+'/'+numGames+'!');
                responseObj.responseTo.should.equal(bidderId,
                    'Response contains incorrect bidder ID in game '+
                    (gameNo+1)+'/'+numGames+'!');
            }
        }
    });
});
