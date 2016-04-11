/**
 * Standard Waiting Room settings.
 */
module.exports = {

    // How many clients must connect before groups are formed.
    POOL_SIZE: 6,

    // The size of each group.
    GROUP_SIZE: 2,

    // Number of games to dispatch.
    N_GAMES: 2,

    // Maximum waiting time.
//    MAX_WAIT_TIME: 30000,

    // Time and date of game start. Overrides `MAX_WAIT_TIME`
    // `START_DATE` is any valid argument to `Date` constructor.
    //    START_DATE: 'December 13, 2015 13:24:00',
    // START_DATE: new Date().getTime() + 30000,

    // Treatment assigned to groups.
    // If left undefined, a random treatment will be selected.
    // Use "treatment_rotate" for rotating the treatments.
    CHOSEN_TREATMENT: 'treatment_rotate',

    DISCONNECT_IF_NOT_SELECTED: true,

    // In the execution mode ´'TIMEOUT'´, one waits until the time is up, then
    // it will be checked whether enough players are there to start the game.
    // In the execution mode ´'WAIT_FOR_N_PLAYERS'´, the game starts right away
    // if there are the desired number of players. Otherwise, when the time is
    // up, it will be checked if there are at least a certain minimum number of
    // players to start the game.

    EXECUTION_MODE: 'WAIT_FOR_N_PLAYERS',

};
