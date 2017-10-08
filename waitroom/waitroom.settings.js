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
    MAX_WAIT_TIME: 10000,

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
     * ## ON_TIMEOUT
     *
     * A callback function to be executed when wait time expires
     */
    // ON_TIMEOUT: function() {
    //    console.log('I am timed out!');
    // },

    /**
     * ## ON_TIMEOUT_SERVER
     *
     * A callback function to be executed on the server when wait time expires
     *
     * The context of execution is WaitingRoom.
     */
    // ON_TIMEOUT_SERVER: function(code) {
    //    console.log('*** I am timed out! ', code.id);
    // }

    /**
     * ## DISPATCH_TO_SAME_ROOM
     *
     * If TRUE, every new group will be added to the same game room
     *
     * A new game room will be created for the first dispatch, and
     * reused for all successive groups. Default, FALSE.
     *
     * !Notice the game must support adding players while it is running.
     *
     * @see WaitingRoom.lastGameRoom
     */
    // DISPATCH_TO_SAME_ROOM: true

    /**
     * ## logicPath
     *
     * If set, a custom implementation of the wait room will be used
     *
     * @see wait.room.js (nodegame-server)
     */
    // logicPath: 'path/to/a/wait.room.js'


    // TODO: add comments.

    // TEXTS:

    TEXTS: {
        
//         disconnect: 'Custom string: DISCONNECTED!',
// 
//         waitedTooLong: 'Custom string: WAITED TOO LONG!',
// 
//         notEnoughPlayers: 'Custom string: NOT ENOUGH PLAYERS!',
// 
//         roomClosed: 'Custom string: ROOM CLOSED! CANNOT ENTER!',
// 
//         tooManyPlayer: 'Custom string: TOO MANY PLAYERS!',
// 
//         notSelectedClosed: 'Custom string: NOT SELECTED CLOSED!',
// 
//         notSelectedOpen: 'Custom string: NOT SELECTED OPEN!',
// 
//         exitCode: 'Custom string: EXIT CODE TEXT',
    },
    
        
    // SOUNDS:

    SOUND: {
//        dispatch: false
    }
};
