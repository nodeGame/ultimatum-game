(function(node) {

    "use strict";
    //var Web3 = require('web3');
    // Register the widget in the widgets collection.
    node.widgets.register('Web3Login', Web3Login);

    var account;
    // ## Add Meta-data

    Web3Login.version = '0.1.2';
    Web3Login.description = 'web3';

    Web3Login.title = false;
    Web3Login.className = 'web3login';

    Web3Login.texts = {
        headerMessage: 'Verification',
        message: 'Please log in with your Web3 Account/Wallet',
        noWeb3: 'Now ethereum extension found. We recommend Metamask' +
                'https://metamask.io/' +
                'Please contact the supervisor for further instructions',
        loginButton: 'Login',
        copyButton: 'Copy',
        signButton: 'Sign Code',
        deleteButton: 'Delete',
        accountAddress: 'Address:',
        showAddress: '0x0',
        NoLoginAlert: 'Log In required',
        Continues: 'Your Wallet Address for the experiment is: ' + account
                    + 'The Address will not be saved',

    };

    // ## Dependencies

    // Checked when the widget is created.
    Web3Login.dependencies = {
    };

    /**
     * ## Web3Login constructor
     *
     * Creates a new instance of Web3Login
     *
     * @param {object} options Configuration options
     *
     * @see Web3Login.init
     */
    function Web3Login(options) {

        /**
         *  Options when Done button is pressed
         *
         */

        if (!options.onDone) {
            this.onDone = {
                addressOnly: true,
                send: true,

            };
        }
        else if ('object' === typeof options.onDone) {
            this.onDone = options.onDone;
        }
        else {
            throw new TypeError('Web3Login constructor: options.onDone ' +
                                'must be string or object. Found: ' +
                                options.onDone);
        }

        this.attempts = null;

        this.account = null;




        this.showWeb3LoginForm = true;

        this.requiredLogin = true;

        /**
         * Web3Login.network
         * Forces to switch network if true
        */
        this.network = true;

        this.submitAddress = true;



        /**
         * ### Web3Login.emailForm
         *
         * EmailForm widget element
         *
         * @see EmailForm
         */
        this.emailForm = null;


        /**
         * ### Web3Login.Web3LoginElement
         *
         * Web3Login HTML element
         *
         * Default: an HTML element,
         * null initially, element added on append()
         */
        this.Web3LoginHTML = null;

        /**
         * ### Web3Login.askServer
         *
         * If TRUE, after being appended it sends a 'WIN' message to server
         *
         * Default: FALSE
         */
        this.askServer = options.askServer || false;

         /**
         * ### Web3Login.setMsg
         *
         * If TRUE, a set message is sent instead of a data msg
         *
         * Default: FALSE
         */
        this.setMsg = !!options.setMsg || true;
    }



    Web3Login.prototype.init = function(options) {

        var that = this

        if (typeof window.ethereum !== 'undefined') {
            console.log('Metamask is installed!');

            web3 = new Web3(Web3.givenProvider);

        }
        else{
            console.log('Now ethereum extension found. We recommend Metamask')
            alert(this.getText('noWeb3'))

        }
        /*async function chainChangedFunction () {
            window.location.reload();
        }  */
        window.ethereum.on('accountsChanged',
            function() {
                that.login()
            });
        window.ethereum.on('disconnect',
            function() {
                that.disconnect()
            });



        if (options.network === true) {
            this.network !== true;
        }
        else if ('boolean' === typeof options.network) {
            this.network = options.network;
        }
        else if ('undefined' !== typeof options.network) {
            throw new TypeError('Web3Login.init: ' + 'otpions.network ' + 'must be boolean or undefined.' +
            'Found: ' + options.network);
        }

        if (options.requiredLogin === true) {
            this.requiredLogin !== true;
        }
        else if ('boolean' === typeof options.requiredLogin) {
            this.requiredLogin = options.requiredLogin;
        }
        else if ('undefined' !== typeof options.requiredLogin) {
            throw new TypeError('Web3Login.init: ' + 'options.requiredLogin ' + 'must be boolean or undefined.' +
            'Found: ' + options.requiredLogin);
        }

        if (options.submitAddress === true) {
            this.submitAddress !== true;
        }
        else if ('boolean' === typeof options.submitAddress) {
            this.submitAddress = options.submitAddress;
        }
        else if ('undefined' !== typeof options.submitAddress) {
            throw new TypeError('Web3Login.init: ' + 'options.submitAddress ' + 'must be boolean or undefined.' +
            'Found: ' + options.submitAddress);
        }


        if (options.Web3LoginForm === false) {
            options.showWeb3LoginForm !== false
        }
        else if ('boolean' === typeof options.Web3LoginForm) {
            this.Web3LoginForm = options.showWeb3LoginForm;
        }
        else if ('undefined' !== typeof options.showWeb3LoginForm) {
            throw new TypeError('Web3LoginForm.init' +
                                'options.showWeb3LoginForm' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showWeb3LoginForm);
        }








        if (this.showEmailForm && !this.emailForm) {
            // TODO: nested properties are overwitten fully. Update.
            this.emailForm = node.widgets.get('EmailForm', J.mixin({
                onsubmit: {
                    send: true,
                    emailOnly: true,
                    updateUI: true
                },
                storeRef: false,
                texts: {
                    label: 'If you would like to be contacted for future ' +
                        'studies, please enter your email (optional):',
                    errString: 'Please enter a valid email and retry'
                },
                setMsg: true // Sends a set message for logic's db.
            }, options.email));
        }

    };

    // Implements the Widget.append method.
    Web3Login.prototype.append = function() {
        this.Web3LoginHTML = this.Web3LoginForm();
        this.bodyDiv.appendChild(this.Web3LoginHTML);
        if (this.askServer) setTimeout(function() { node.say('WIN'); });
    };

    /**
     * ### Web3Login.makeWeb3Login
     *
     * Builds up the end screen (HTML widget)
     */
    Web3Login.prototype.Web3LoginForm = function() {
        var Web3LoginElement;
        var headerElement;

        var web3LoginDiv, web3LoginParaElement, web3LoginInputElement, web3LoginBtn, web3DeleteBtn, web3LoginGroup;

        var that = this;

        Web3LoginElement = document.createElement('div');
        Web3LoginElement.className = 'Web3Login';

        headerElement = document.createElement('h1');
        headerElement.innerHTML = this.getText('headerMessage');
        //Web3LoginElement.appendChild(headerElement);



        if (this.showWeb3LoginForm) {

        web3LoginDiv = document.createElement('div');
        web3LoginDiv.className = 'input-group'

        web3LoginParaElement = document.createElement('p');
        web3LoginParaElement.innerHTML = '<strong>' + this.getText('message') + '</strong>';
        Web3LoginElement.appendChild(web3LoginParaElement);

        web3LoginInputElement = document.createElement('input');
        web3LoginInputElement.setAttribute('placeholder', 'Address ')
        web3LoginInputElement.setAttribute('disabled', 'true');
        web3LoginInputElement.setAttribute('type', 'string')
        web3LoginInputElement.className = 'web3Login-address ' +
                                             'form-control';
        web3LoginInputElement.setAttribute('id', 'showAddress')

        web3LoginBtn = document.createElement('button');
        web3LoginBtn.innerHTML = this.getText('loginButton');
            web3LoginBtn.type = 'button';
            web3LoginBtn.onclick = function() {
                that.login();
            };

        web3DeleteBtn = document.createElement('button');
        web3DeleteBtn.innerHTML = this.getText('deleteButton');
            web3DeleteBtn.type = 'button';
            web3DeleteBtn.onclick = function() {
                that.delete();
            };

        web3LoginGroup = document.createElement('span');
        web3LoginGroup.className = 'input-group-btn';
        web3LoginGroup.appendChild(web3LoginBtn);
        web3LoginGroup.appendChild(web3DeleteBtn);
        web3LoginDiv.appendChild(web3LoginGroup);

        web3LoginDiv.appendChild(web3LoginInputElement);
        Web3LoginElement.appendChild(web3LoginDiv);

        //Store Reference
        this.web3LoginInputElement = web3LoginInputElement;
        this.web3LoginGroup = web3LoginGroup;

        }

        return Web3LoginElement;
    };



    Web3Login.prototype.switchNetwork = async function(){
        try {
                await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xa86a' }],
                });
            } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{ chainId: '43114', rpcUrl: 'https://api.avax.network/ext/bc/C/rpc' /* ... */ }],
                    });
                }
                catch (addError) {
                // handle "add" error
                }
            }

        }

    }

    // Login
    Web3Login.prototype.login = async function() {
        var that = this;
        var accounts;

        if (this.network) {
            this.switchNetwork();
        }

        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
            if (accounts) {
                this.account = accounts[0];
            }
            else {
                this.disconnect();
            }

        }
        catch (e) {
            if (e.code=== -32002) {
                alert('Please connect to Metamask manually. ');
            }
        }


        this.updateDisplay(that.account);


        //error.code === -32002
    }

    Web3Login.prototype.notification = function(opt) {
        var that=this;
        if (opt === true) {
            alert('Your Wallet Address for the experiment is: ' + that.account +' '
                + 'The Address will not be linked with your decisions');
                return that.account;
        }
        else {alert
            (this.getText('NoLoginAlert'));
        }
    }


    // Implements the Widget.listeners method.
    Web3Login.prototype.listeners = function() {

    };

    Web3Login.prototype.delete = function() {
        this.account = null;
        this.updateDisplay(null)
    }

    Web3Login.prototype.copy = function(text) {
        var inp = document.createElement('input');
        try {
            document.body.appendChild(inp);
            inp.value = text;
            inp.select();
            document.execCommand('copy', false);
            inp.remove();
            alert(this.getText('exitCopyMsg'));
        }
        catch (err) {
            alert(this.getText('exitCopyError'));
        }
    };

    Web3Login.prototype.checkAddress = function(address) {
        var isAccount, res;
        isAccount = web3.utils.isAddress(address);
        res = { values: account, property: isAccount };
        return isAccount;
    }

    Web3Login.prototype.getValues = function() {
        var isAccount, address, connection, listen;
        var that=this;
        connection=ethereum.isConnected();
        listen=web3.eth.net.isListening();
        if(connection===false || listen===false) {
            return false
        }
        if(this.submitAddress && this.requiredLogin) {
            address=that.account
            isAccount=this.checkAddress(address);
            this.notification(isAccount);
            if (isAccount === true) {
                this.sendValues({ values: address });
                return address;
            }
            else {
                this.attempts ++;

                this.highlight;
                return false
            }
        }
        else if (this.requiredLogin) {
            isAccount=this.checkAddress(account);
            if (isAccount === true) {
                return true;
            }
            else {
                this.attempts ++;
                this.highlight;
                return false;
            }
        }
    }

    Web3Login.prototype.sendValues = function(opts) {
        var values;
        opts = opts || { addressOnly: true };
        values = opts.values || this.getValues(opts);
        if (this.setMsg) {
            if ('string' === typeof values) values = { address: values };
            node.set(values, opts.to || 'SERVER');
        }
        else {
            node.say('address', opts.to || 'SERVER', values);
        }
        return values;
    };

    Web3Login.prototype.disconnect = function() {
        this.account=null;
        this.updateDisplay(this.account);
    }


    /**
     * ### Web3Login.updateDisplay
     *
     * Updates the display
     *
     * @param {object} address An object containing the info to update. Format:
     *
     */
    Web3Login.prototype.updateDisplay = function(account) {
        var addressHTML;

        addressHTML = this.web3LoginInputElement;
        if (!account) {
            addressHTML.value = 'Address ';
        }
        else {
            addressHTML.value = account;
        }



    };

    /**
     * Highlight Button
     */
    Web3Login.prototype.highlight = function(border) {
        if (border && 'string' !== typeof border) {
            throw new TypeError('EmailForm.highlight: border must be ' +
                                'string or undefined. Found: ' + border);
        }
        if (this.highlighted === true) return;

        this.web3LoginGroup.style.border = border || '1px solid red';
        this.highlighted = true;
        console.log(this.highlighted);
        this.emit('highlighted', border);
    };

})(node);
