/**
 * # Player code for Ultimatum Game
 * Copyright(c) 2023 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Handles biddings, and responses between two players.
 *
 * Extensively documented tutorial.
 *
 * http://www.nodegame.org
 */

// Export the game-creating function.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    // nodegame v8 experimental.
    // `gameRoom.use`: sets a policy to configure nodeGame.
    // Policy `initMultiPlayer` inits the game by adding a header with widgets
    // and the mainframe where all the pages are loaded.

    gameRoom.use({

        initMultiPlayer: {

            stager: stager,

            customInit: function() {
                // Add additional debug information while developing the game.
                // node.game.debugInfo =
                //    node.widgets.append('DebugInfo', W.getHeader())

                // Add event listeners valid for the whole game.

                // Note: this listener isn't strictly necessary for this game,
                // however it is useful to illustrate how node.emit and node.on
                // work in tandem.
                node.on('RESPONSE_DONE', function(resp) {

                    // Write to screen.
                    W.write(' You ' + resp + ' the offer.', W.gid('container'));

                    //////////////////////////////////////////////
                    // nodeGame hint:
                    //
                    // node.done() communicates to the server that
                    // the player has completed the current state.
                    //
                    // The parameters are send to the server with
                    // a SET message. This SET message has two
                    // properties by default:
                    //
                    // - time: time passed since the begin of the step
                    // - timeup: if a timeup happened
                    // - partner: if any is assigned by the matcher in logic
                    // - role:    if any is assigned by the matcher in logic
                    //
                    // which can be overwritten by user.
                    //
                    /////////////////////////////////////////////
                    node.done({ response: response });
                });
            }
        }

    });

    ////////////////////////////////////////////////////////////
    // nodeGame hint: extend step.
    //
    // A step is a set of properties under a common label (id).
    //
    // Here, we set two properties:
    //
    // - widget: create a widget step
    // - css: adds CSS instructions to the page
    //
    // Properties are looked up with a cascade mechanism. That is,
    // all steps inherit the properties defined at the stage level in
    // which they are inserted. All stages inherit the properties
    // defined at the game level. Finally, it fallbacks to nodeGame defaults.
    //
    // To add/modify properties use the commands:
    //
    // `stager.extendStep`: modifies a step
    // `stager.extendStage`: modifies a stage, and all enclosed steps
    // `stager.setDefaultProperty`: modifies all stages and steps
    //
    ////////////////////////////////////////////////////////////
    stager.extendStep('selectLanguage', {
        css: '#container { padding-top: 60px };',
        widget: 'LanguageSelector'
    });

    /////////////////////////////////////////////////////////////
    // nodeGame hint: the frame property and the settings object
    //
    // The `frame` property defines which page is loaded. Here
    // we take the value from settings (the file game.settings.js).
    // Because the loaded settings depend on the treatment, here
    // are loading the instructions specific to the treatment.
    //
    //
    // Pages are loaded from the public/ directory inside the
    // game folder. However, they can also be loaded from the
    // views/ directory (if not found in public/).
    //
    // What happens if no `frame` property is specified?
    // Nothing is loaded, unless it is a widget step (like the previous step),
    // where the default page (/pages/default.htm) is loaded from the server;
    // a copy of this page is available in the public/ folder of this game
    // (it is a copy, so changes won't be reflected, unless you
    // set it as the `frame` property).
    //
    // Good to know:
    // - Additional options exist for the `frame` param to automatically
    //   search & replace the DOM, and store a page in the cache.
    // - While the game is running, the settings are available under:
    //   `node.game.settings`.
    ////////////////////////
    stager.extendStep('instructions', {
        frame: settings.instructionsPage
    });

    // QUIZ.
    ////////

    // Quiz texts.
    const quiz = {
        howMuchMainText:
        'How many coins will you divide with your partner?',
        howMuchChoices: [
            '50',
            '100',
            '0'
        ],

        rejectMainText: 'If you are a bidder what happens if ' +
            'your partner rejects your offer?',
        rejectChoices: [
            'He or she does not get anything, I keep my share.',
            'I get everything.',
            'He or she gets what I offered, I get nothing.',
            'Both of us get nothing.'
        ],

        disconnectMainText:
            'Consider the following scenario. Four players ' +
            '(A,B,C,D) are playing. B disconnects for more than ' +
            '30 seconds, and the game is terminated. What happens then?',
        disconnectChoices: [
            'A,C,D are paid only the show up fee. B is not paid at all.',
            'A,C,D are paid the show up fee plus the bonus collected ' +
                'so far. B is paid only the show up fee.',
            'A,C,D are paid the show up fee plus the bonus collected ' +
                'so far. B is not paid at all.',
            'All players are paid only the show up fee.',
            'All players are paid the show up fee and the bonus ' +
                'collected so far.'
        ]
    };


    stager.extendStep('quiz', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the ChoiceManager widget
        //

        /////////////////////////////////////////////////////////////
        widget: {
            forms: [
                {
                    id: 'howMuch',
                    mainText: quiz.howMuchMainText,
                    choices: quiz.howMuchChoices,
                    correctChoice: 1

                },
                {
                    id: 'reject',
                    orientation: 'v',
                    mainText: quiz.rejectMainText,
                    choices: quiz.rejectChoices,
                    correctChoice: 3
                },
                {
                    id: 'disconnect',
                    orientation: 'v',
                    mainText: quiz.disconnectMainText,
                    choices: quiz.disconnectChoices,
                    correctChoice: treatmentName === 'pp' ? 1 : 3
                }
            ],
            formsOptions: {
                shuffleChoices: true
            }
        }
    });

    stager.extendStep('risk', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the widget property
        //
        // It is a shortcut to create widget-steps.
        //
        // In a widget-step, the following operations are performed:
        //
        //   1- The widget is loaded, possibly appended. If no frame
        //      is specified, the default page
        //      '/pages/default.html' will be loaded.
        //   2- Upon `node.done`, the current values of the widget
        //      are validated, and if valid, and not timeup will be
        //      sent to server.
        //   3- Upon exiting the step, the widget will be destroyed.
        //
        // As a string, it just includes the name of the widget:
        //
        // ```
        // widget: 'RiskGauge'
        // ```
        //
        // As an object, additional options can be set:
        //
        // ```
        // widget: {
        //     name: 'RiskGauge',
        //
        //     // Widget-specific options here.
        //
        //     // General options for all widgets:
        //
        //     id:            'myid',
        //     ref:           'myref', // A reference added as node.game[ref]
        //     append: false,          // Does not append to widget to the page
        //     root:                   // The id of the element under which
        //                             // appending the widget, or a function
        //                             // returning the element.
        //     destroyOnExit: false    // Does not destroy the element when
        //                             // the step ends.
        // }
        // ```
        //
        // See: https://github.com/nodeGame/nodegame/wiki/RiskGauge-Widget-v8
        //////
        widget: {
            name: 'RiskGauge',
            method: 'Bomb'
        },
        // Note: DoneButton initially disabled, will be automatically
        // re-enabled by the Risk widget upon completing the task.
        donebutton: false
    });

    stager.extendStep('bidder', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: roles
        //
        // The same step can be played differently by different players,
        // if roles are assigned. Inside a role object, it is possible
        // to redefine each step property to fit the purpose of the role.
        /////////////////////////////////////////////////////////////////
        roles: {
            BIDDER: {
                frame: 'bidder.html',
                widget: {
                    name: 'CustomInput',
                    mainText: 'Make an offer between 0 and ' +
                        settings.COINS + ' to another player',
                    ref: 'bid',
                    type: 'int',
                    min: 0,
                    max: settings.COINS,
                    requiredChoice: true
                },

                /////////////////////////////////////////////////////////////
                // nodeGame hint: the timeup parameter
                //
                // It can be a string (to be emitted as an event), or a
                // function to be executed when `node.game.timer` expires.
                // Note that if no `timer` property is set for current step,
                // then the timeup function will not be automatically called.
                //
                // The default timeup is different for player and logic client
                // types. For players, by default it is a call to `node.done()`.
                ////////////////////////////////////////////////////////////////
                timeup: function() {
                    // Generates a random bid.
                    node.game.bid.setValues();
                    node.done();
                },

                done: function(result) {
                    var root, offer;

                    // result is returned by node.game.bid.getValues()
                    offer = result.value;

                    // Write text.
                    root = W.gid('container');
                    W.writeln(' Your offer: ' +  offer +
                              '. Waiting for the responder... ', root);

                    // Notify server.
                    // Note: If the done callback does not return a value,
                    // then result is sent to server.
                    return { offer: offer };
                }
            },
            RESPONDER: {
                /////////////////////////////////////////////////////////////
                // nodeGame hint: the init function
                //
                // It is a function that is executed before the main callback,
                // and before loading any frame.
                //
                // Likewise, it is possible to define an `exit` function that
                // will be executed upon exiting the step.
                //
                // Notice that if the function is defined at the level of the
                // stage, it will be executed only once upon entering the
                // stage. If, you need to have it executed every round the
                // stage is repeated, add it to the first step of the stage.
                //
                // There is also an `exit` callback, executed when exiting
                // the stage or step.
                ////////////////////////////////////////////////////////////
                init: function() {
                    node.game.offerReceived = null;
                },
                donebutton: false,
                frame: 'resp.html',

                //////////////////////////////////////////////
                // nodeGame hint: cb step property
                //
                // It defines the callback that will be called during the step.
                // By default, each steps inherits an empty callback, so that
                // it is not necessary to implement the cb property, if the
                // player has, for example, only to read a text.
                ////////////////////////////////////////////////
                cb: function() {
                    var that;

                    //////////////////////////////////////////////
                    // nodeGame hint: context
                    //
                    // var that = this;
                    //
                    // Unlike many other programming languages, in javascript
                    // the object /this/ assumes different values depending
                    // on the scope of the function where it is called.
                    //
                    // Inside the step-callback `this` references `node.game`.
                    //
                    // We bind the value of `this` to another variable (`that`),
                    // so that we can still access it inside the callback
                    // function of the method `node.on.data`.
                    ////////////////////////////////////////////////////////////
                    that = this;
                    node.on.data('BID', function(msg) {
                        that.offerReceived = msg.data;
                        node.done();
                    });
                },
                timeup: null
            },
            SOLO: {
                frame: 'solo.html',
                cb: function() {
                    node.timer.random().done();
                }
            }
        }
    });

    stager.extendStep('responder', {

        //////////////////////////////////////////
        // nodeGame hint: the donebutton parameter
        //
        // The DoneButton widget reads it disables it (false).
        // If string, it replaces the text on the button.
        /////////////////
        donebutton: false,

        roles: {
            RESPONDER: {
                frame: 'resp.html',
                timeup: function() {
                    var response;
                    response = Math.random() > 0.5 ? 'accepted' : 'rejected';
                    console.log('randomaccept');
                    node.emit('RESPONSE_DONE', response);
                },
                cb: function() {
                    // If for any reason an offer is not found here (e.g.,
                    // bidder disconnected in previous round, show an error
                    // and reject.)
                    if (!this.offerReceived) {
                        node.emit('RESPONSE_DONE', 'rejected');
                        return;
                    }
                    W.setInnerHTML('theoffer', this.offerReceived);
                    W.show('offered');

                    W.gid('accept').onclick = function() {
                        //////////////////////////////////////////////
                        // nodeGame hint: emit
                        //
                        // `node.emit` fires an event locally. To send
                        // an event through the network use `node.say`.
                        ///////////////////////////////////////////////
                        node.emit('RESPONSE_DONE', 'accepted');
                    };

                    W.gid('reject').onclick = function() {
                        node.emit('RESPONSE_DONE', 'rejected');
                    };
                }
            },
            BIDDER: {
                frame: 'bidder.html',
                cb: function() {
                    //////////////////////////////////////////////
                    // nodeGame hint:
                    //
                    // nodeGame offers several types of event
                    // listeners. They are all resemble the syntax
                    //
                    // node.on.<target>
                    //
                    // For example: node.on.data(), node.on.plist().
                    //
                    // The low level event listener is simply
                    //
                    // node.on
                    //
                    // For example, node.on('in.say.DATA', cb) can
                    // listen to all incoming DATA messages.
                    /////////////////////////////////////////////
                    node.on.data('RESPONSE', function(msg) {
                        node.game.visualTimer.stop();
                        // Write inside the element with id "containter".
                        W.write(' Your offer was ' + msg.data + '.',
                                W.gid('container'));
                        node.timer.random(3000).done();
                    });
                },
                timeup: null
            },
            SOLO: {
                frame: 'solo.html',
                cb: function() {
                    node.timer.random().done();
                }
            }
        }
    });

    stager.extendStep('questionnaire', {
        cb: function() {

            /////////////////////////////////////////////////////////////
            // nodeGame hint: more control on widgets survey widgets
            //
            // Widgets can be created programmatically inside a step callback.
            // This is useful, for instance, if the options are depending
            // the state of the game.
            /////////////////////////
            var options = {
                id: 'quest',
                mainText: 'If the game was terminated because of a ' +
                          'player disconnection, in your opinion, why ' +
                          'did the other player disconnect?',
                choices: [
                    'He or she was losing.',
                    'Technical failure.',
                    'The player found a more rewarding task.',
                    'The game was boring, not clear, too long, etc.',
                    'Not applicable.'
                ],
                shuffleChoices: true,
                orientation: 'v'
            };

            this.quest = node.widgets.append('ChoiceTable',
                                             W.gid('quiz'),
                                             options);
        },
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the done callback
        //
        // `done` is a callback execute after a call to `node.done()`
        // If it returns FALSE, the call to `node.done` is canceled.
        // Other return values are sent to the server, and replace any
        // parameter previously passed to `node.done`.
        //////////////////////////////////////////////
        done: function() {
            var answers, isTimeup;
            answers = this.quest.getValues();
            isTimeup = node.game.timer.isTimeup();
            if ('undefined' === typeof answers.choice && !isTimeup) {
                this.quest.highlight();
                return false;
            }
            return answers;
        }
    });

    stager.extendStep('endgame', {
        // Another widget-step (see the risk step above).
        widget: 'EndScreen',
        init: function() {
            node.game.visualTimer.destroy();
            node.game.doneButton.destroy();
        }
    });
};
