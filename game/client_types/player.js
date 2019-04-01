/**
 * # Player code for Ultimatum Game
 * Copyright(c) 2018 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Handles biddings, and responses between two players.
 *
 * Extensively documented tutorial.
 *
 * http://www.nodegame.org
 */

var ngc = require('nodegame-client');
var Stager = ngc.Stager;

// Export the game-creating function.
module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var cbs;
    var channel = gameRoom.channel;
    var node = gameRoom.node;

    // Import other functions used in the game.
    cbs = require(__dirname + '/includes/player.callbacks.js');

    // Specify init function, and extend steps.

    // Init callback.
    stager.setOnInit(cbs.init);

    ////////////////////////////////////////////////////////////
    // nodeGame hint: step propreties.
    //
    // A step is a set of properties under a common label (id).
    //
    // Properties are looked up with a cascade mechanism. That is,
    // all steps inherit the properties defined at the stage level in
    // which they are inserted. All stages inherit the properties
    // defined at the game level. Finally, it fallbacks on nodeGame defaults.
    //
    // The property named `cb` is one of the most important.
    //
    // It defines the callback that will be called during the step.
    // By default, each steps inherits an empty callback, so that
    // it is not necessary to implement the cb property, if the
    // player has, for example, only to read a text.
    //
    // To add/modify properties use the commands:
    //
    // `stager.extendStep`: modifies a step
    // `stager.extendStage`: modifies a stage, and all enclosed steps
    // `stager.setDefaultProperty`: modifies all stages and steps
    //
    ////////////////////////////////////////////////////////////
    stager.extendStep('selectLanguage', {
        frame: 'languageSelection.html',
        cb: function() {
            node.game.lang = node.widgets.append('LanguageSelector',
                                                 W.getFrameDocument().body);
        }
    });

    stager.extendStep('precache', {
        //////////////////////////////////////////////
        // nodeGame hint:
        //
        // Pages can be preloaded with this method: W.preCache()
        //
        // The content of a URI is cached in an array, and
        // loaded again from there when needed.
        // Pages that embed JS code should be cached with caution.
        /////////////////////////////////////////////
        cb: function() {
            W.lockScreen('Loading...');
            console.log('pre-caching...');
            W.preCache([
                // Precache some pages for demonstration.
                'languageSelection.html',
                'quiz.html',
                'questionnaire.html'
            ], function() {
                console.log('Precache done.');
                // Pre-Caching done; proceed to the next stage.
                node.done();
            });
        }
    });

    stager.extendStep('instructions', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the settings object
        //
        // The settings object is automatically populated with the
        // settings specified for the treatment chosen by the waiting
        // room (file: game.settings.js). Settings are sent to each remote
        // client and it is available under: `node.game.settings`.
        /////////////////////////////////////////////////////////////
        frame: settings.instructionsPage
    });

    stager.extendStep('quiz', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the frame parameter
        //
        // The frame parameter is passed to `W.loadFrame` to
        // load a new page. Additional options exist to automatically
        // search & replace the DOM, and store a page in the cache.
        // In its simplest form, it is just a string indicating the
        // path to the page to load.
        //
        // Pages are loading from the public/ directory inside the
        // game folder. However, they can also be loaded from the
        // views/ directory (if not found in public/).
        /////////////////////////////////////////////////////////////
        frame: 'quiz.html',
        cb: function() {
            var w, qt, t;
            t = this.settings.treatmentName;
            qt = this.quizTexts;

            /////////////////////////////////////////////////////////////
            // nodeGame hint: the widget collection
            //
            // Widgets are re-usable components with predefined methods,
            // such as: hide, highlight, disable, getValues, etc.
            // Here we use the `ChoiceManager` widget to create a quiz page.
            ////////////////////////////////////////////////////////////////
            w = node.widgets;
            this.quiz = w.append('ChoiceManager', W.gid('quiz'), {
                id: 'quizzes',
                title: false,
                forms: [
                    w.get('ChoiceTable', {
                        id: 'howMuch',
                        shuffleChoices: true,
                        title: false,
                        choices: qt.howMuchChoices,
                        correctChoice: 1,
                        mainText: qt.howMuchMainText
                    }),
                    w.get('ChoiceTable', {
                        id: 'reject',
                        shuffleChoices: true,
                        title: false,
                        orientation: 'v',
                        choices: qt.rejectChoices,
                        correctChoice: 3,
                        mainText: qt.rejectMainText
                    }),
                    w.get('ChoiceTable', {
                        id: 'disconnect',
                        shuffleChoices: true,
                        title: false,
                        orientation: 'v',
                        choices: qt.disconnectChoices,
                        correctChoice: t === 'pp' ? 1 : 3,
                        mainText: qt.disconnectMainText
                    })
                ]
            });
        },
        done: function() {
            var answers, isTimeup;
            answers = this.quiz.getValues({
                markAttempt: true,
                highlight: true
            });
            isTimeup = node.game.timer.isTimeup();
            if (!answers.isCorrect && !isTimeup) return false;
            return answers;
        }
    });

    stager.extendStep('mood', {
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
        // widget: 'MoodGauge'
        // ```
        //
        // As an object, additional options can be set:
        //
        // ```
        // widget: {
        //     name: 'MoodGauge',
        //     id: 'myid',
        //     ref: 'myref', // It will be added as node.game[ref]
        //     options: { ... }, // Options passed to `node.widgets.append()`
        //     append: false,
        //     checkAnswers: false,
        //     root: ...
        //     destroyOnExit: false
        // }
        // ```
        //////
        widget: {
            name: 'MoodGauge',
            options: {
                panel: false,
                title: false
            }
        }
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
                    ref: 'bid',
                    options: {
                        type: 'int',
                        min: 0,
                        max: settings.COINS,
                        requiredChoice: true,
                        className: 'centered',
                        root: 'container',
                        mainText: 'Make an offer between 0 and ' +
                            settings.COINS + ' to another player'
                    }
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
                    var rndBid =
                        Math.floor(Math.random() *
                                   (node.game.settings.COINS + 1));
                    node.game.bid.setValues(rndBid);
                    node.done();
                },
                done: function(offer) {
                    var root, timeup;
                    timeup = this.timer.isTimeup();

                    // Variable offer is defined only in case of a reconnection.
                    if ('undefined' !== typeof offer) {
                        offer = node.game.bid.getValues().value;
                        // Save references.
                        node.game.lastOffer = offer;
                    }

                    // Write to text.
                    root = W.gid('container');
                    W.writeln(' Your offer: ' +  offer +
                              '. Waiting for the respondent... ', root);


                    if ('undefined' !== typeof offer) {
                        // Notify the other player.
                        node.say('OFFER', node.game.partner, offer);

                        // Notify the server.
                        return { offer: offer };
                    }
                }
            },
            RESPONDENT: {
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
                cb: function() {
                    var that;
                    // It was a reconnection.
                    if (this.offerReceived !== null) node.done();

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
                    node.on.data('OFFER', function(msg) {
                        that.offerReceived = msg.data;
                        node.done();
                    });
                },
                timeup: null
            },
            SOLO: {
                frame: 'solo.html',
                cb: function() {
                    this.node.timer.randomDone();
                }
            }
        }
    });

    stager.extendStep('respondent', {
        /////////////////////////////////////////////////////////////
        // nodeGame hint: role and partner
        //
        // By default `role` and a `partner` are valid only within a step,
        // but it is possible to carry over the values between steps.
        //
        // Role and partner meaning:
        //   - falsy      -> delete (default),
        //   - true       -> keep current value,
        //   - string     -> as is (must exist),
        //   - function   -> must return null or a valid role name
        //////////////////////////////////////////////////////////
        role: function() { return this.role; },
        partner: function() { return this.partner; },
        donebutton: false,
        roles: {
            RESPONDENT: {
                timeup: function() {
                    node.game.resTimeup();
                },
                cb: function() {
                    W.setInnerHTML('theoffer', this.offerReceived);
                    W.show('offered');

                    W.gid('accept').onclick = function() {
                        //////////////////////////////////////////////
                        // nodeGame hint: emit
                        //
                        // `node.emit` fires an event locally. To send
                        // an event through the network use `node.say`.
                        ///////////////////////////////////////////////
                        node.emit('RESPONSE_DONE', 'ACCEPT');
                    };

                    W.gid('reject').onclick = function() {
                        node.emit('RESPONSE_DONE', 'REJECT');
                    };
                }
            },
            BIDDER: {
                cb: function() {
                    var root;
                    root = W.gid('container');

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
                    node.on.data('ACCEPT', function(msg) {
                        node.game.visualTimer.stop();
                        W.write(' Your offer was accepted.', root);
                        node.timer.randomDone(3000);
                    });
                    node.on.data('REJECT', function(msg) {
                        node.game.visualTimer.stop();
                        W.write(' Your offer was rejected.', root);
                        node.timer.randomDone(3000);
                    });
                },
                timeup: null
            },
            SOLO: {
                cb: function() {
                    this.node.timer.randomDone();
                }
            }
        }
    });

    stager.extendStep('endgame', {
        frame: 'generic.htm',
        // Another widget-step (see the mood step above).
        widget: {
            name: 'EndScreen',
            root: 'container',
            options: {
                panel: false,
                title: false,
                showEmailForm: true,
                showFeedbackForm: true,
                email: {
                    texts: {
                        label: 'Enter your email (optional):',
                        errString: 'Please enter a valid email and retry'
                    }
                },
                feedback: { minLength: 50 }
            }
        },
        //////////////////////////////////////////
        // nodeGame hint: the donebutton parameter
        //
        // The DoneButton widget reads this: it can set
        // the text on the button, or disable it (false).
        /////////////////
        donebutton: false,
        // Callback using for testing purposes, ignore it
        cb: function() {
            console.log('PHANTOMJS EXITING');
        }
    });

    stager.extendStep('questionnaire', {
        cb: function() {
            var qt;
            qt = this.questTexts;
            this.quest = node.widgets.append('ChoiceTable',
                                             W.gid('quiz'),
                                             {
                                                 id: 'quest',
                                                 mainText: qt.mainText,
                                                 choices: qt.choices,
                                                 freeText: qt.freeText,
                                                 title: false,
                                                 shuffleChoices: true,
                                                 orientation: 'v'
                                             });
        },
        frame: 'questionnaire.html',
        /////////////////////////////////////////////////////////////
        // nodeGame hint: the done callback
        //
        // `done` is a callback execute after a call to `node.done()`
        // If it returns FALSE, the call to `node.done` is canceled.
        // Other return values are sent to the server, and replace any
        // parameter previously passed to `node.done`.
        //////////////////////////////////////////////
        done: function(args) {
            var answers, isTimeup;
            answers = this.quest.getValues();
            isTimeup = node.game.timer.isTimeup();
            if (!answers.choice && !isTimeup) {
                this.quest.highlight();
                return false;
            }
            return answers;
        }
    });

};
