/**
 * # Player code for Ultimatum Game
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players.
 * Extensively documented tutorial.
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var Stager = ngc.Stager;
var stepRules = ngc.stepRules;
var constants = ngc.constants;

// Export the game-creating function. It needs the name of the treatment and
// its options.
module.exports = function(gameRoom, treatmentName, settings) {

    var game, MIN_PLAYERS;
    var gameSequence, stager;
    var cbs;

    // The game object to return at the end of the function.
    game = {};

    // Import the stager.
    gameSequence = require(__dirname + '/game.stages.js')(settings);
    stager = ngc.getStager(gameSequence);

    // Import other functions used in the game.

    cbs = require(__dirname + '/includes/player.callbacks.js');

    // Specify init function, and extend default stages.

    // Init callback.
    stager.setOnInit(cbs.init);

    stager.setOnGameOver(function() {
        // Do something if you like!
    });

    // Add all the stages into the stager.

    //////////////////////////////////////////////
    // nodeGame hint:
    //
    // A minimal stage must contain two properties:
    //
    // - id: a unique name for the stage
    // - cb: a callback function to execute once
    //     the stage is loaded.
    //
    // When adding a stage / step into the stager
    // there are many additional options to
    // configure it.
    //
    // Properties defined at higher levels are
    // inherited by each nested step, that in turn
    // can overwrite them.
    //
    // For example if a step is missing a property,
    // it will be looked into the enclosing stage.
    // If it is not defined in the stage,
    // the value set with _setDefaultProperties()_
    // will be used. If still not found, it will
    // fallback to nodeGame defaults.
    //
    // The most important properties are used
    // and explained below.
    //
    /////////////////////////////////////////////

    // A step rule is a function deciding what to do when a player has
    // terminated a step and entered the stage level _DONE_.
    // Other stepRules are: SOLO, SYNC_STAGE, SYNC_STEP, OTHERS_SYNC_STEP.
    // In this case the client will wait for a command from the server.
    stager.setDefaultStepRule(stepRules.WAIT);

    // stager.setDefaultProperty('done', cbs.clearFrame);

    MIN_PLAYERS = [ settings.MIN_PLAYERS, cbs.notEnoughPlayers ];

    stager.extendStep('selectLanguage', {
        cb: cbs.selectLanguage,
        timer: 100000,
        minPlayers: MIN_PLAYERS
    });

    stager.extendStep('precache', {
        cb: cbs.precache,
        // `minPlayers` triggers the execution of a callback in the case
        // the number of players (including this client) falls the below
        // the chosen threshold. Related: `maxPlayers`, and `exactPlayers`.
        minPlayers: MIN_PLAYERS,
        // syncOnLoaded: true,
    });

    stager.extendStep('instructions', {
        cb: cbs.instructions,
        minPlayers: MIN_PLAYERS,
        // syncOnLoaded: true,
        timer: 90000
    });

    stager.extendStep('quiz', {
        cb: cbs.quiz,
        minPlayers: MIN_PLAYERS,
        // syncOnLoaded: true,
        // `timer` starts automatically the timer managed by the widget
        // VisualTimer if the widget is loaded. When the time is up it fires
        // the DONE event.
        // It accepts as parameter:
        //  - a number (in milliseconds),
        //  - an object containing properties _milliseconds_, and _timeup_
        //     the latter being the name of the event to fire (default DONE)
        // - or a function returning the number of milliseconds.
        timer: 60000,
        done: function() {
            try {
                var b, QUIZ, answers, isTimeup;
                QUIZ = W.getFrameWindow().QUIZ;
                b = W.getElementById('submitQuiz');

                answers = QUIZ.checkAnswers(b);
                isTimeUp = node.game.timer.gameTimer.timeLeft <= 0;

                if (!answers.__correct__ && !isTimeUp) {
                    return false;
                }

                answers.timeUp = isTimeUp;

                // On TimeUp there are no answers
                node.set('QUIZ', answers);
                node.emit('INPUT_DISABLE');
                // We save also the time to complete the step.
                node.set('timestep', {
                    time: node.timer.getTimeSince('step'),
                    timeup: isTimeUp
                });
                return true;
            }
            catch(error) {
                node.set("Error", "Quiz Error " + error);
                setTimeout(function() {
                    node.done();
                }, 100);
            }

        }
    });

    stager.extendStep('ultimatum', {
        cb: cbs.ultimatum,
        minPlayers: MIN_PLAYERS,
        // `syncOnLoaded` forces the clients to wait for all the others to be
        // fully loaded before releasing the control of the screen to the
        // players.  This options introduces a little overhead in
        // communications and delay in the execution of a stage. It is probably
        // not necessary in local networks, and it is FALSE by default.
        // syncOnLoaded: true
    });

    stager.extendStep('endgame', {
        cb: cbs.endgame
    });

    stager.extendStep('questionnaire', {
        cb: cbs.postgame,
        timer: 90000,
        // `done` is a callback function that is executed as soon as a
        // _DONE_ event is emitted. It can perform clean-up operations (such
        // as disabling all the forms) and only if it returns true, the
        // client will enter the _DONE_ stage level, and the step rule
        // will be evaluated.
        done: function() {
            var q1, q2, q2checked, i, isTimeup;
            q1 = W.getElementById('comment').value;
            q2 = W.getElementById('disconnect_form');
            q2checked = -1;

            for (i = 0; i < q2.length; i++) {
                if (q2[i].checked) {
                    q2checked = i;
                    break;
                }
            }

            isTimeUp = node.game.timer.gameTimer.timeLeft <= 0;

            // If there is still some time left, let's ask the player
            // to complete at least the second question.
            if (q2checked === -1 && !isTimeUp) {
                alert('Please answer Question 2');
                return false;
            }

            node.set('questionnaire', {
                q1: q1 || '',
                q2: q2checked
            });

            node.emit('INPUT_DISABLE');
            node.set('timestep', {
                time: node.timer.getTimeSince('step'),
                timeup: isTimeUp
            });
            return true;
        }
    });

    // We serialize the game sequence before sending it.
    game.plot = stager.getState();

    // Let's add the metadata information.
    game.metadata = {
        name: 'ultimatum',
        version: '0.2.0',
        description: 'no descr'
    };

    // Other settings, optional.
    game.settings = {
        publishLevel: 2
    };
    game.env = {
        auto: settings.AUTO,
        treatment: treatmentName
    };
    game.verbosity = 0;

    game.debug = settings.DEBUG;
    game.nodename = 'player';

    return game;
};
