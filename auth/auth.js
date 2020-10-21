/**
 * # Authorization functions for Ultimatum Game
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Sets authorizations for accessing the Ultimatum channels.
 * ---
 */
module.exports = function(auth, settings) {


    // Custom authorization function.
    // Note: it is executed before the client the PCONNECT listener.
    // Here direct messages to the client can be sent only using
    // his socketId property, since no clientId has been created yet.
    function authPlayers(channel, info) {
        let token = info.cookies.token;
        let code = channel.getClient(token);

        // Code not existing.
        if (!code) {
            console.log('not existing token: ', token);
            return false;
        }

        if (code.checkedOut) {
            console.log('token was already checked out: ', token);
            return false;
        }

        // Code in use.
        // usage is for LOCAL check, IsUsed for MTURK
        if (code.valid === false) {
            if (code.disconnected) {
                return true;
            }
            else {
                console.log('token already in use: ', token);
                return false;
            }
        }

        // Client Authorized
        return true;
    }

    // Assigns player id.
    function idGen(channel, info) {
      // Let player specify its own client id via query string.
      if (info.query.clientId) return info.query.clientId;
      // Otherwise generate random ID.
      return channel.registry.generateClientId();
    }

    // Add properties to the player object.
    function decorateClientObj(clientObject, info) {
        if (info.headers) clientObject.userAgent = info.headers['user-agent'];
    }

    // Assigning the auth callbacks to the player server.

    // auth.authorization('player', authPlayers);
    // auth.clientIdGenerator('player', idGen);

    auth.clientObjDecorator('player', decorateClientObj);

};
