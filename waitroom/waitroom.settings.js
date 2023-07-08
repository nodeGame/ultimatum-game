/**
 * # Waiting Room settings
 * Copyright(c) 2023 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Waiting room settings
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    /**
     * ## EXECUTION_MODE
     *
     * Sets the execution mode of the waiting room
     *
     * Different modes might have different default values, and need
     * different settings.
     *
     * Available modes:
     *
     *   - `TIMEOUT`, waits until the time is up, then it checks
     *        whether enough players are connected to start the game.
     *   - `WAIT_FOR_N_PLAYERS`, the game starts right away as soon as
     *        the desired number of connected players is reached.
     *   - `WAIT_FOR_DISPATCH`, the game starts when it receives a
     *        command to dispatch from the monitor.
     */
    // EXECUTION_MODE: 'TIMEOUT',
    EXECUTION_MODE: 'WAIT_FOR_N_PLAYERS',
    // EXECUTION_MODE: 'WAIT_FOR_DISPATCH',

    /**
     * ## POOL_SIZE
     *
     * How many clients must connect before groups are formed
     */
    POOL_SIZE: 2,

    /**
     * ## GROUP_SIZE
     *
     * The size of each group
     */
    GROUP_SIZE: 2,

    /**
     * ## N_GAMES
     *
     * Number of games to dispatch
     *
     * If set, wait room will close after N_GAME have been dispatched.
     */
    // N_GAMES: 1,

    /**
     * ## MAX_WAIT_TIME
     *
     * Maximum waiting time in the waiting room
     */
    // MAX_WAIT_TIME: 60000,

    /**
     * ## START_DATE
     *
     * Time and date of game start.
     *
     * Overrides `MAX_WAIT_TIME`. Accepted values: any valid
     * argument to `Date` constructor.
     */
    // START_DATE: 'December 13, 2015 13:24:00',
    // START_DATE: new Date().getTime() + 300000,

    /**
     * ## CHOSEN_TREATMENT
     *
     * The treatment assigned to every new group
     *
     * It can be the name of a treatment (string), or any valid value:
     *
     *   - "treatment_rotate": rotates the treatments (to offset set
     *                         ROTATION_OFFSET != 0).
     *
     *   - "treatment_latin_square": rotates across all treatments maximizing
     *                               randomness in the sequence.
     *
     *   - "treatment_random": picks a random treatment each time.
     *
     *   - "treatment_weighted_random": randomly samples treatments based
     *                                  on weights defined in TREATMENT_WEIGHTS.
     *
     *   - undefined: defaults to "treatment_random".
     *
     *   - function: a callback returning the name of the treatment:
     *
     *       function(treatments, roomCounter, groupIdx, dispatchCounter) {
     *           return treatments[dispatchCounter % treatments.length];
     *       }
     */
    CHOSEN_TREATMENT: function(treatments, roomCounter,
                               groupIdx, dispatchCounter) {

        // - treatments: array of available treatments.
        // - roomCounter: total number of room created (it is initialized to
        //                the last created room as loaded in the data folder).
        // - groupIdx: zero-based group index within same dispatch
        //             (when POOL_SIZE > GROUP_SIZE).
        // - dispatchCounter: total number of dispatch calls (a dispatch can
        //                    send players to an existing room, so it may
        //                    differ from roomCounter).

        // console.log(roomCounter, batchCounter, dispatchCounter);

        return treatments[dispatchCounter % treatments.length];
    },

    /**
    * ## ROTATION_OFFSET (integer > 0) Optional
    *
    * Offsets the rotation when CHOSEN_TREATMENT = "treatment_rotate"
    *
    * Default: 0.
    *
    * @see CHOSEN_TREATMENT
    */
    // ROTATION_OFFSET: 0,

    /**
    * ## TREATMENT_WEIGHTS (object) Optional
    *
    * Sampling weights when CHOSEN_TREATMENT = "treatment_weighted_random"
    *
    * Weights do no need to sum to one, they are normalized.
    *
    * Treatments that are not listed in TREATMENT_WEIGHTS divide equally
    * the share of weights not assigned to other treatments. For example:
    * if a game has 5 treatments treatment1 has a weight of 0.6, treatments2-4
    * all get a weight of 0.1.
    *
    * Default: equal weights for all
    *
    * @see CHOSEN_TREATMENT
    */
    // TREATMENT_WEIGHTS: {
        // pp: 0.2,
        // standard: 0.8
    // },

    /**
     * ## DISCONNECT_IF_NOT_SELECTED
     *
     * Disconnect clients if not selected for a game when dispatching
     */
    DISCONNECT_IF_NOT_SELECTED: false,

    /**
     * ## REMOTE_DISPATCH (string|object) Optional
     *
     * Redirects participants to a third-party server upon dispatch
     *
     * Default: false.
     */
     // If string.
     // REMOTE_DISPATCH: 'https://nodegame.org' // Redirect address.
     // If object.
     // REMOTE_DISPATCH: {
     //
     //     // Redirect address.
     //     url: 'https://nodegame.org',
     //
     //     // If TRUE, appends to the redirect address ?t=treatmentName.
     //     addTreatment: true,
     //
     //     // Manipulates the url before remote dispatch. Parameters:
     //     // - url: redirect address after addTreatment is evaluated.
     //     // - treatment: selected treatment.
     //     // - group: array of player ids to dispatch
     //     // - waitRoom: reference to the waitRoom object itself.
     //     preprocess: (url, treatment, group, waitRoom) => {
     //         // Example: adds the group size and the  id of all players
     //         // to the redirect address.
     //         let ids = group.join(',');
     //         return url + '&l=' + group.length + '&ids=' + ids;
     //     }
     // }

    /**
     * ## PLAYER_SORTING
     *
     * Sorts the order of players before dispatching them
     *
     * Sorting takes place only if:
     *
     *  - the number of connected players > GROUP_SIZE,
     *  - PLAYER_GROUPING is undefined
     *
     * Accepted values:
     *
     *   - 'timesNotSelected': (default) gives priority to players that
     *        have not been selected by a previous call to dispatch
     *   - undefined: rollback to default choice
     *   - null: no sorting (players are anyway randomly shuffled).
     *   - function: a comparator function implementing a criteria
     *       for sorting two objects. E.g:
     *
     *        function timesNotSelected(a, b) {
     *            if ((a.timesNotSelected || 0) < b.timesNotSelected) {
     *                return -1;
     *            }
     *            else if ((a.timesNotSelected || 0) > b.timesNotSelected) {
     *                return 1;
     *            }
     *            return 0;
     *        }
     */
    // PLAYER_SORTING: 'timesNotSelected'

    /**
     * ## PLAYER_GROUPING
     *
     * Creates groups of players to be assigned to treatments
     *
     * This method is alternative to "sorting" and will be invoked only
     * if the number of connected players > GROUP_SIZE
     *
     * @param {PlayerList} pList The list of players to group
     * @param {number} nGroups The number of groups requested by current
     *   dispatch
     *
     * @return {array} An array of nGroups arrays of player objects
     */
    // PLAYER_GROUPING: function(pList, nGroups) {
    //     return [ [ pl1, pl2 ] [ pl3, pl4 ] ];
    // }

    /**
     * ## ON_TIMEOUT (function) Optional
     *
     * A callback function to be executed on the client when wait time expires
     */
    // ON_TIMEOUT: function() {
    //    console.log('I am timed out!');
    // },

    /**
     * ## ON_TIMEOUT_SERVER (function) Optional
     *
     * A callback function to be executed on the server when wait time expires
     *
     * The context of execution is WaitingRoom.
     */
    // ON_TIMEOUT_SERVER: function(code) {
    //    console.log('*** I am timed out! ', code.id);
    // }

    /**
     * ## ON_OPEN (function) Optional
     *
     * Callback to be executed when the waiting room becomes "open"
     *
     * Receives as first parameter the waiting room object itself.
     */
    // this.ON_OPEN = null;

    /**
     * ### WaitingRoom.ON_CLOSE (function) Optional
     *
     * Callback to be executed when the waiting room becomes "close"
     *
     * Receives as first parameter the waiting room object itself.
     */
    // this.ON_CLOSE = null;

    /**
     * ## ON_CONNECT (function) Optional
     *
     * Callback to be executed when a player connects
     *
     * Receives as first parameter the waiting room object itself.
     */
    // ON_CONNECT: function(waitRoom, player) {
    //     // Auto play with bots on connect.
    //     if (player.clientType === 'bot') return;
    //     waitRoom.dispatchWithBots();
    // },

    /**
     * ## ON_DISCONNECT (function) Optional
     *
     * Callback to be executed when a player disconnects
     *
     * Receives as first parameter the waiting room object itself.
     */
    // this.ON_DISCONNECT = null;

    /**
     * ## ON_INIT (function) Optional
     *
     * Callback to be executed after the settings have been parsed
     *
     * Receives as first parameter the waiting room object itself.
     */
    // this.ON_INIT = null;

    /**
     * ## ON_DISPATCH (function) Optional
     *
     * Callback to be executed just before starting dispatching
     *
     * Receives as first parameter the waiting room object itself,
     * and the options of the dispatch call as second parameter.
     */
    // this.ON_DISPATCH = null;

    /**
     * ## ON_DISPATCHED (function) Optional
     *
     * Callback to be executed at the end of a dispatch call
     *
     * Receives as first parameter the waiting room object itself,
     * and the options of the dispatch call as second parameter.
     */
    // this.ON_DISPATCHED = null;

    /**
     * ## ON_FAILED_DISPATCH (function) Optional
     *
     * Callback to be executed if a dispatch attempt failed
     *
     * Receives as first parameter the waiting room object itself,
     * the options of the dispatch call as second parameter, and
     * optionally the error message as third parameter.
     */
    // this.ON_FAILED_DISPATCH = null;

    /**
     * ## DISPATCH_TO_SAME_ROOM (boolean) Optional
     *
     * If TRUE, every new group will be added to the same game room
     *
     * A new game room will be created for the first dispatch, and
     * reused for all successive groups. Default, FALSE.
     *
     * Notice: the game must support adding players while it is running.
     *
     * Default: FALSE
     *
     * @see WaitingRoom.lastGameRoom
     */
    // DISPATCH_TO_SAME_ROOM: true

    /**
     * ## PING_BEFORE_DISPATCH (boolean) Optional
     *
     * If TRUE, all players are pinged before a dispatch
     *
     * Non-responding clients are disconnected.
     *
     * If only one player is needed and mode is 'WAIT_FOR_N_PLAYERS',
     * pinging is skipped.
     *
     * Default: TRUE
     *
     * @see WaitingRoom.dispatch
     */
    // PING_BEFORE_DISPATCH: true,

    /**
     * ## PING_MAX_REPLY_TIME (number > 0) Optional
     *
     * The number of milliseconds to wait for a reply from a PING
     *
     * Default: 3000
     *
     * @see PING_BEFORE_DISPATCH
     */
    // PING_MAX_REPLY_TIME: 3000,

    /**
     * ## PING_DISPATCH_ANYWAY (boolean) Optional
     *
     * If TRUE, dispatch continues even if disconnections occur during PING
     *
     * Default: FALSE
     *
     * @see PING_BEFORE_DISPATCH
     * @see PING_MAX_REPLY_TIME
     */
    // PING_DISPATCH_ANYWAY: false,

    /**
     * ## logicPath (string) Optional
     *
     * If set, a custom implementation of the wait room will be used
     *
     * @see wait.room.js (nodegame-server)
     */
    // logicPath: 'path/to/a/wait.room.js',

    /**
     * ## PAGE_TITLE (object) Optional
     *
     * Sets the page title, optionally adds to page
     *
     * An object containing the title, and a flag if the same text should
     * be added in a H1 element at the top of the page.
     *
     * Default: { title: 'Welcome!', addToBody: true }
     */
    // PAGE_TITLE: { title: 'Welcome!', addToBody: true },

    /** ### TEXTS
     *
     * Collections of texts displayed when given events occurs
     *
     * Each item can be a string, or function returning a string; the function
     * receives two input parameters: the instance of the widget and an object
     * with extra information (depending on the event).
     *
     * @see WaitingRoom.texts
     */
    TEXTS: {

        /**
         * #### blinkTitle
         *
         * Blinks the title of the tab to signal the beginning of the game
         */
        // blinkTitle: 'Custom string: Game Starts!',

        /**
         * #### disconnect
         *
         * Disconnected from waiting room
         */
        // disconnect: 'Custom string: YOU HAVE BEEN DISCONNECTED!',

        /**
         * #### waitedTooLong
         *
         * The MAX_WAIT_TIME countdown expired
         */
        // waitedTooLong: 'Custom string: YOU WAITED TOO LONG!',

        /**
         * #### notEnoughPlayers
         *
         * There are not enough players to start a game
         */
        // notEnoughPlayers: 'Custom string: NOT ENOUGH PLAYERS!',

        /**
         * #### notEnoughPlayers
         *
         * A player tries to connect, but the waiting room has been closed
         */
        // roomClosed: 'Custom string: ROOM CLOSED! CANNOT ENTER!',

        /**
         * #### notEnoughPlayers
         *
         * Currently there are more players than needed by the game
         */
        // tooManyPlayer: 'Custom string: TOO MANY PLAYERS!',

        /**
         * #### notSelectedClosed
         *
         * Player has not been selected, and cannot participate in other games
         */
        // notSelectedClosed: 'Custom string: NOT SELECTED CLOSED!',

        /**
         * #### notSelectedOpen
         *
         * Player has not been selected, but can still participate in new games
         */
        // notSelectedOpen: 'Custom string: NOT SELECTED OPEN!',


        /**
         * #### notSelectedOpen
         *
         * Player disconnected, and an exit code might have been provided
         */
        // exitCode: 'Custom string: EXIT CODE TEXT',


        playBot: 'Play'
    },

    /** ### SOUNDS
     *
     * Collections of sounds played when given events occurs
     *
     * Each item can be a string, or function returning a string; the function
     * receives two input parameters: the instance of the widget and an object
     * with extra information (depending on the event).
     *
     * @see WaitingRoom.sounds
     */
    SOUNDS: {

        /**
         * ## dispatch
         *
         * Notifies players that a game is about to be dispatched
         *
         * If TRUE, plays default sound, if string plays the file sound
         * located at the specified uri
         *
         */
        // dispatch: false
    },

    // Options to control if users can start the game and how.
    //////////////////////////////////////////////////////////

    /** ### ALLOW_USER_DISPATCH
     *
     * Allows a player to request to start the game immediately with bots
     *
     * A button is added to the interface.
     *
     * Option previously named `ALLOW_PLAY_WITH_BOTS`
     */
    ALLOW_USER_DISPATCH: true,

    /** ### ALLOW_SELECT_TREATMENT
     *
     * Allows a player to select the treatment for the game
     *
     * This option requires `ALLOW_USER_DISPATCH` to be TRUE.
     *
     * A button is added to the interface.
     *
     * @see ALLOW_USER_DISPATCH
     */
    ALLOW_SELECT_TREATMENT: true,

    /** ### ADD_DEFAULT_TREATMENTS
     *
     * If TRUE, default treatments (e.g., `treatment_rotate`) are displayed
     *
     * This option requires both `ALLOW_USER_DISPATCH` and
     * `ALLOW_SELECT_TREATMENT` to be TRUE.
     *
     * Default FALSE
     *
     * @see ALLOW_USER_DISPATCH
     * @see ALLOW_SELECT_TREATMENT
     */
    ADD_DEFAULT_TREATMENTS: true,

    /** ### TREATMENT_TILES
     *
     * Displays treatments as tiles instead of a dropdown menu
     *
     * This is useful to create a simple user interface to select treatments
     *
     * This option requires both `ALLOW_USER_DISPATCH` and
     * `ALLOW_SELECT_TREATMENT` to be TRUE.
     *
     * Default TRUE
     *
     * @see ALLOW_USER_DISPATCH
     * @see ALLOW_SELECT_TREATMENT
     */
    TREATMENT_TILES: true,

    /** ### TREATMENT_TILE_CB
     *
     * Callback to render each treatment tile
     *
     * This option requires `ALLOW_USER_DISPATCH`, `ALLOW_SELECT_TREATMENT`,
     * and `TREATMENT_TILES` to be TRUE.
     *
     * Default TRUE
     *
     * @see TREATMENT_TILES
     */
    TREATMENT_TILE_CB: function(treat, descr, idx, widget) {
        var str, imgs, img;

        if (treat.substring(0, 10) === 'treatment_') {
            treat = treat.substring(10, 22);
            img = 'circle.png'
        }
        else {
            imgs = {
                pp: "clock.png",
                standard: "square.png",
            };
            img = imgs[treat];
        }

        str = '<div title="' + descr + '">';
        if (img) {
            str += '<img style="width: 30px; margin-right: 20px;" src="icons/';
            str += img + '" />'
        }
        str += treat + '</div>';

        return str;
    },

    /** ### ALLOW_QUERYSTRING_TREATMENT
     *
     * Allows treatment to be selected via query string
     *
     * If so, the game immediately starts if a user connects to an url like:
     *
     * https://gameserver.com/game/?treat=treamentName
     *
     * This option requires both `ALLOW_USER_DISPATCH` and
     * `ALLOW_SELECT_TREATMENT` to be TRUE.
     *
     * @see QUERYSTRING_TREATMENT_VAR
     *
     * Default: FALSE
     */
    ALLOW_QUERYSTRING_TREATMENT: true,

    /** ### QUERYSTRING_TREATMENT_VAR
     *
     * Sets the querystring variable to select a treatment
     *
     * This option requires `ALLOW_USER_DISPATCH`, `ALLOW_SELECT_TREATMENT`,
     * and `ALLOW_QUERYSTRING_TREATMENT` to be TRUE.
     *
     * Default: "treat"
     */
    QUERYSTRING_TREATMENT_VAR: "treat"

};
