/**
 * # Waiting Room settings
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
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
     *   - ´TIMEOUT´, waits until the time is up, then it checks
     *        whether enough players are connected to start the game.
     *   - ´WAIT_FOR_N_PLAYERS´, the game starts right away as soon as
     *        the desired number of connected players is reached.
     */
    // EXECUTION_MODE: 'TIMEOUT',
    EXECUTION_MODE: 'WAIT_FOR_N_PLAYERS',

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
     * If set, it will close the waiting room after N_GAMES
     * have been dispatched
     */
    // N_GAMES: 1,

    /**
     * ## MAX_WAIT_TIME
     *
     * Maximum waiting time in the waiting room
     */
    MAX_WAIT_TIME: 60000,

    /**
     * ## START_DATE
     *
     * Time and date of game start.
     *
     * Overrides `MAX_WAIT_TIME`. Accepted values: any valid
     * argument to `Date` constructor.
     */
    // START_DATE: 'December 13, 2015 13:24:00',
    // START_DATE: new Date().getTime() + 30000,

    /**
     * ## CHOSEN_TREATMENT
     *
     * The treatment assigned to every new group
     *
     * Accepted values:
     *
     *   - "treatment_rotate": rotates the treatments.
     *   - undefined: a random treatment will be selected.
     *   - function: a callback returning the name of the treatment. E.g:
     *
     *       function(treatments, roomCounter) {
     *           return treatments[num % treatments.length];
     *       }
     *
     */
    CHOSEN_TREATMENT: function(treatments, roomCounter) {
        return treatments[roomCounter % treatments.length];
    },

    /**
     * ## DISCONNECT_IF_NOT_SELECTED (experimental)
     *
     * Disconnect clients if not selected for a game when dispatching
     */
    DISCONNECT_IF_NOT_SELECTED: false,

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
    // this.ON_CONNECT = null;

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

    /** ### ALLOW_PLAY_WITH_BOTS
     *
     * Allows a player to request to start the game immediately with bots
     *
     * A button is added to the interface.
     */
    ALLOW_PLAY_WITH_BOTS: true,

    /** ### ALLOW_SELECT_TREATMENT
     *
     * Allows a player to select the treatment for the game
     *
     * This option requires `ALLOW_PLAY_WITH_BOTS` to be TRUE.
     *
     * A button is added to the interface.
     *
     * @experimental
     */
    ALLOW_SELECT_TREATMENT: true
};
