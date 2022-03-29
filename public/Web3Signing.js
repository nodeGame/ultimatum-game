(function(node) {

    "use strict";
    //var Web3 = require('web3');
    // Register the widget in the widgets collection.
    node.widgets.register('Web3Signing', Web3Signing);


    // ## Add Meta-data

    Web3Signing.version = '0.0.1';
    Web3Signing.description = 'Game end screen. With end game message, ' +
                            ' web3, and exit code.';

    Web3Signing.title = false;
    Web3Signing.className = 'Web3Signing';

    Web3Signing.texts = {
        headerMessage: 'Thank you for participating!',
        message: 'You have now completed this task and your data has ' +
                 'been saved. Please login with your Wallet on the Avalanche Network ' +
                 'and sign the exit code to obtain the Payment ',
        totalWin: 'Your total win:',
        exitCode: 'Your exit code:',
        errTotalWin: 'Error: invalid total win.',
        errExitCode: 'Error: invalid exit code.',
        loginButton: 'Login',
        copyButton: 'Copy',
        signButton: 'Sign Code',
        accountAddress: 'Address:',
        exitCopyMsg: 'Exit code copied to clipboard.',
        exitCopyError: 'Failed to copy exit code. Please copy it manually.',
        signPayMsg: 'You successfully signed the message with your account, You will receive the payment in a few days.',
        signPayError: 'Failed to signing the Exit Code. Please Login and try again or call the supervisor.'

    };

    // ## Dependencies

    // Checked when the widget is created.
    Web3Signing.dependencies = {
        Web3: {},
        Feedback: {},
        EmailForm: {}
    };

    /**
     * ## Web3Signing constructor
     *
     * Creates a new instance of Web3Signing
     *
     * @param {object} options Configuration options
     *
     * @see Web3Signing.init
     */
    function Web3Signing(options) {



        this._totalWin = null;
        this._exitCode = null;

        this.signature = null;

        this.code = null

        this.updateUI = true;

        this.web3SignBtn = null;
        /**
         * ### Web3Signing.showEmailForm
         *
         * If true, the email form is shown
         *
         * Default: true
         */
        this.showEmailForm = true;

        /**
         * ### Web3Signing.showFeedbackForm
         *
         * If true, the feedback form is shown
         *
         * Default: true
         */
        this.showFeedbackForm = true;

        /**
         * ### Web3Signing.showTotalWin
         *
         * If true, the total win is shown
         *
         * Default: true
         */
         this.showTotalWin = true;

        /**
         * ### Web3Signing.showExitCode
         *
         * If true, the exit code is shown
         *
         * Default: true
         */
        this.showExitCode = false;

        this.network = false;

        this.showWeb3Login = false;
        /**
         * ### Web3Signing.showWeb3Sign
         *
         * If true, the web3 signing for payment is shown.
         * For this you need to login to your web3 Account -> showWeb3Login = true
         */
        this.showWeb3Sign = true;

        this.account = null;
        /**
         * ### Web3Signing.totalWinCurrency
         *
         * The currency displayed after totalWin
         *
         * Default: 'USD'
         */
         this.totalWinCurrency = 'AVAX';

        /**
         * ### Web3Signing.totalWinCb
         *
         * If defined, the return value is displayed inside the totalWin box
         *
         * Accepts two parameters: a data object (as sent from server), and
         * the reference to the EndScreen.
         */
        this.totalWinCb = null;

        /**
         * ### Web3Signing.emailForm
         *
         * EmailForm widget element
         *
         * @see EmailForm
         */
        this.emailForm = null;

        /**
         * ### Web3Signing.feedback
         *
         * Feedback widget element
         *
         * @see Feedback
         */
        this.feedback = null;

        /**
         * web3 Login widget element
         */

        this.web3Login = null;

        /**
         * ### Web3Signing.Web3SigningElement
         *
         * Web3Signing HTML element
         *
         * Default: an HTML element,
         * null initially, element added on append()
         */
        this.Web3SigningHTML = null;

        /**
         * ### Web3Signing.askServer
         *
         * If TRUE, after being appended it sends a 'WIN' message to server
         *
         * Default: FALSE
         */
        this.askServer = options.askServer || false;

        /**
         * ### Web3Signing.setMsg
         *
         * If TRUE, a set message is sent instead of a data msg
         *
         * Default: FALSE
         */
         this.setMsg = !!options.setMsg || false;
    }



    Web3Signing.prototype.init = function(options) {

        /**
        * Where do I put these functions?
        */

        var that = this

        if (typeof window.ethereum !== 'undefined') {
            console.log('Metamask is installed!');
            web3 = new Web3(Web3.givenProvider);
            this.login();
        }else{
            console.log('Now ethereum extension found. We recommend Metamask')

        }

        window.ethereum.on('accountsChanged', function() {
            that.login()});
        //window.ethereum.on('chainChanged', chainChangedFunction);



        if (options.email === false) {
            this.showEmailForm = false;
        }
        else if ('boolean' === typeof options.showEmailForm) {
            this.showEmailForm = options.showEmailForm;
        }
        else if ('undefined' !== typeof options.showEmailForm) {
            throw new TypeError('Web3Signing.init: ' +
                                'options.showEmailForm ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showEmailForm);
        }

        if (options.feedback === false) {
            this.showFeedbackForm = false;
        }
        else if ('boolean' === typeof options.showFeedbackForm) {
            this.showFeedbackForm = options.showFeedbackForm;
        }
        else if ('undefined' !== typeof options.showFeedbackForm) {
            throw new TypeError('Web3Signing.init: ' +
                                'options.showFeedbackForm ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showFeedbackForm);
        }

        if (options.totalWin === false) {
            this.showTotalWin = false;
        }
        else if ('boolean' === typeof options.showTotalWin) {
            this.showTotalWin = options.showTotalWin;
        }
        else if ('undefined' !== typeof options.showTotalWin) {
            throw new TypeError('Web3Signing.init: ' +
                                'options.showTotalWin ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showTotalWin);
        }

        if (options.exitCode === false) {
            options.showExitCode !== false
        }
        else if ('boolean' === typeof options.showExitCode) {
            this.showExitCode = options.showExitCode;
        }
        else if ('undefined' !== typeof options.showExitCode) {
            throw new TypeError('Web3Signing.init: ' +
                                'options.showExitCode ' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showExitCode);
        }

        if (options.Web3Sign === false) {
            options.showWeb3Sign !== false
        }
        else if ('boolean' === typeof options.showWeb3Sign) {
            this.showWeb3Sign = options.showWeb3Sign;
        }
        else if ('undefined' !== typeof options.showWeb3Sign) {
            throw new TypeError('Web3Sign.init' +
                                'options.showWeb3Sign' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showWeb3Sign);
        }

        if (options.Web3Login === false) {
            options.Web3Login !== false
        }
        else if ('boolean' === typeof options.Web3Login) {
            this.Web3Login= options.Web3Login;
        }
        else if ('undefined' !== typeof options.showWeb3Login) {
            throw new TypeError('Web3LoginForm.init' +
                                'options.showWeb3LoginForm' +
                                'must be boolean or undefined. ' +
                                'Found: ' + options.showWeb3Login);
        }

        if (this.showWeb3Login) {
            this.web3Login = node.widgets.get('Web3Login');
        }




        if ('string' === typeof options.totalWinCurrency &&
                 options.totalWinCurrency.trim() !== '') {

            this.totalWinCurrency = options.totalWinCurrency;
        }
        else if ('undefined' !== typeof options.totalWinCurrency) {
            throw new TypeError('Web3Signing.init: ' +
                                'options.totalWinCurrency must be undefined ' +
                                'or a non-empty string. Found: ' +
                                options.totalWinCurrency);
        }

        if (options.totalWinCb) {
            if ('function' === typeof options.totalWinCb) {
                this.totalWinCb = options.totalWinCb;
            }
            else {
                throw new TypeError('Web3Signing.init: ' +
                                    'options.totalWinCb ' +
                                    'must be function or undefined. ' +
                                    'Found: ' + options.totalWinCb);
            }
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

        if (this.showFeedbackForm) {
            this.feedback = node.widgets.get('Feedback', J.mixin(
                { storeRef: false, minChars: 50, setMsg: true },
                options.feedback));
        }
    };

    // Implements the Widget.append method.
    Web3Signing.prototype.append = function() {
        this.Web3SigningHTML = this.makeWeb3Signing();
        this.bodyDiv.appendChild(this.Web3SigningHTML);
        if (this.askServer) setTimeout(function() { node.say('WIN'); });
    };

    /**
     * ### Web3Signing.makeWeb3Signing
     *
     * Builds up the end screen (HTML + nested widgets)
     */
    Web3Signing.prototype.makeWeb3Signing = function() {
        var Web3SigningElement;
        var headerElement, messageElement;
        var totalWinElement, totalWinParaElement, totalWinInputElement;
        var exitCodeElement, exitCodeParaElement, exitCodeInputElement;
        var exitCodeBtn, exitCodeGroup;
        var web3LoginElement;
        var web3SignElement, web3SignParaElement, web3SignInputElement, web3SignBtn;
        var web3SignBtnC, web3SignGroup;
        var that = this;

        Web3SigningElement = document.createElement('div');
        Web3SigningElement.className = 'Web3Signing';

        headerElement = document.createElement('h1');
        headerElement.innerHTML = this.getText('headerMessage');
        Web3SigningElement.appendChild(headerElement);

        messageElement = document.createElement('p');
        messageElement.innerHTML = this.getText('message');
        Web3SigningElement.appendChild(messageElement);

        web3LoginElement = document.createElement('p');


        Web3SigningElement.appendChild(web3LoginElement);


        if (this.showWeb3Login) {
            node.widgets.append(this.web3Login, Web3SigningElement, {
                title: false,
                panel: false
            });
        }



        if (this.showTotalWin) {
            totalWinElement = document.createElement('div');

            totalWinParaElement = document.createElement('p');
            totalWinParaElement.innerHTML = '<strong>' +
                this.getText('totalWin') +
                '</strong>';

            totalWinInputElement = document.createElement('input');
            totalWinInputElement.className = 'Web3Signing-total form-control';
            totalWinInputElement.setAttribute('disabled', 'true');

            totalWinParaElement.appendChild(totalWinInputElement);
            totalWinElement.appendChild(totalWinParaElement);

            Web3SigningElement.appendChild(totalWinElement);
            this.totalWinInputElement = totalWinInputElement;
        }


        /*if (this.showExitCode) {
            exitCodeElement = document.createElement('div');
            exitCodeElement.className = 'input-group';

            exitCodeParaElement = document.createElement('span');
            exitCodeParaElement.innerHTML = '<strong>' +
                this.getText('exitCode') + '</strong>';

            exitCodeInputElement = document.createElement('input');
            exitCodeInputElement.id = 'exit_code';
            exitCodeInputElement.className = 'Web3Signing-exit-code ' +
                                             'form-control';
            exitCodeInputElement.setAttribute('disabled', 'true');

            exitCodeGroup = document.createElement('span');
            exitCodeGroup.className = 'input-group-btn';

            exitCodeBtn = document.createElement('button');
            exitCodeBtn.className = 'btn btn-default Web3Signing-copy-btn';
            exitCodeBtn.innerHTML = this.getText('copyButton');
            exitCodeBtn.type = 'button';
            exitCodeBtn.onclick = function() {
                that.copy(exitCodeInputElement.value);
            };

            exitCodeGroup.appendChild(exitCodeBtn);
            Web3SigningElement.appendChild(exitCodeParaElement);
            exitCodeElement.appendChild(exitCodeGroup);
            exitCodeElement.appendChild(exitCodeInputElement);

            Web3SigningElement.appendChild(exitCodeElement);
            this.exitCodeInputElement = exitCodeInputElement;
        }
        */

        if (this.showWeb3Sign) {
            web3SignElement = document.createElement('div');
            web3SignElement.className = 'input-group';

            web3SignParaElement = document.createElement('span');
            web3SignParaElement.innerHTML = '<strong>' +
                this.getText('exitCode') + '</strong>';

            web3SignInputElement = document.createElement('input');
            web3SignInputElement.id = 'exit_code';
            web3SignInputElement.className = 'Web3Signing-exit-code ' +
                                            'form-control';
            web3SignInputElement.setAttribute('disabled', 'true');

            web3SignGroup = document.createElement('span');
            web3SignGroup.className = 'input-group-btn';

            web3SignBtnC = document.createElement('button');
            web3SignBtnC.className = 'btn btn-default Web3Signing-copy-btn';
            web3SignBtnC.innerHTML = this.getText('copyButton');
            web3SignBtnC.type = 'button';
            web3SignBtnC.onclick = function() {
                that.copy(web3SignInputElement.value);
            };

            web3SignBtn = document.createElement('button');
            web3SignBtn.className = 'btn btn-default Web3Signing-sign-btn';
            web3SignBtn.innerHTML = this.getText('signButton');
            web3SignBtn.type = 'button';
            web3SignBtn.onclick = function() {
                that.signMessage(web3SignInputElement.value);
            };

            web3SignGroup.appendChild(web3SignBtnC);
            web3SignGroup.appendChild(web3SignBtn);
            Web3SigningElement.appendChild(web3SignParaElement);
            web3SignElement.appendChild(web3SignGroup);
            web3SignElement.appendChild(web3SignInputElement);

            Web3SigningElement.appendChild(web3SignElement);

            this.web3SignBtn = web3SignBtn;
            this.web3SignInputElement = web3SignInputElement;
        }


        if (this.showEmailForm) {
            node.widgets.append(this.emailForm, Web3SigningElement, {
                title: false,
                panel: false
            });
        }

        if (this.showFeedbackForm) {
            node.widgets.append(this.feedback, Web3SigningElement, {
                title: false,
                panel: false
            });
        }





        return Web3SigningElement;
    };

    Web3Login.prototype.switchNetwork = async function() {
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xa86a' }],
            });
        }
        catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [ {
                            chainId: '43114',
                            rpcUrl: 'https://api.avax.network/ext/bc/C/rpc'
                        }],
                    });
                }
                catch (addError) {
                // handle "add" error
                }
            }

        }
    };

    // Login
    Web3Signing.prototype.login = async function() {
        var that = this;
        var accounts;

        if (this.network) {
            this.switchNetwork();
        }
        try {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts'});
            this.account = accounts [0];
        } catch (e) {
            if (e.code=== -32002) {
                alert('Please connect to Metamask manually. ');
            }
        }
    }

    // Sign message
    Web3Signing.prototype.signMessage = async function(code) {
        var amount, hashMessage;
        this.login();
        this.code = code;
        amount = getTotalWin.call(this);

        try {
            hashMessage = web3.utils.sha3('code');
            this.signature = await web3.eth.personal.sign(hashMessage, this.account);
            console.log(this.signature);
            this.getValues(amount);
        } catch (e) {
            alert(this.getText('signPayError'));
        }

        /*
        try {

            hashMessage = web3.utils.sha3('code');
            signature = await web3.eth.personal.sign(hashMessage, account);
            console.log(signature);
            // send signature payment amount and account to database or where it will be payed
            alert(this.getText('signPayMSG'));
        } catch (err) {
            alert(this.getText('signPayError'));
        }
        */
    };

    // Implements the Widget.listeners method.
    Web3Signing.prototype.listeners = function() {
        var that;
        that = this;
        node.on.data('WIN', function(message) {
            that.updateDisplay(message.data);
        });
    };

    Web3Signing.prototype.copy = function(text) {
        var inp = document.createElement('input');
        try {
            document.body.appendChild(inp);
            inp.value = text;
            inp.select();
            document.execCommand('copy', false);
            inp.remove();
            alert(this.getText('exitCopyMsg'));
        } catch (err) {
            alert(this.getText('exitCopyError'));
        }
    };

    Web3Signing.prototype.getValues = function(total) {
        var values;
        if (!this.address || !this.code || !this.signature) {return false};
        total = total || this.signMessage();
        if (this.updateUI) {
            if (this.web3SignBtn) {
                this.web3SignBtn.disabled = true;
                this.web3SignBtn.innerHTML = 'Signed!';
            }
        }
        values = {
            address: this.account,
            exitCode: this.code,
            signature: this.signature,
            totalWin: total
        };

        this.sendValues(values);
        return values;

    }

    Web3Signing.prototype.sendValues = function(values) {
        var address, exitCode, signature, totalWin, opts;
        opts = opts || {};
        values = values || this.getValues()
        address= values.address
        exitCode = values.exitCode;
        signature= values.signature;
        totalWin= values.totalWin;
        if (this.setMsg) {
            node.set(values, opts.to || 'SERVER');
        }
        else {
            node.say('address', opts.to || 'SERVER', address);
            node.say('exitCode', opts.to || 'SERVER', exitCode);
            node.say('signature', opts.to  || 'SERVER', signature);
            node.say('totalWin', opts.to || 'SERVER', totalWin);
        }
        console.log(values);
        return values;

    }



    /**
     * ### Web3Login.updateDisplay
     *
     * Updates the display
     *
     * @param {object} data An object containing the info to update. Format:
     *    - total: The total won.
     *    - exit: An exit code.
     */
     Web3Signing.prototype.updateDisplay = function(data) {
        var preWin, totalWin, totalRaw, exitCode;
        var totalHTML, exitCodeHTML, ex, err;

        if (this.totalWinCb) {
            totalWin = this.totalWinCb(data, this);
        }
        else {
            if ('undefined' === typeof data.total &&
                'undefined' === typeof data.totalRaw) {

                throw new Error('Web3Signing.updateDisplay: data.total and ' +
                                'data.totalRaw cannot be both undefined.');
            }

            if ('undefined' !== typeof data.total) {
                totalWin = J.isNumber(data.total);
                if (totalWin === false) {
                    node.err('Web3Signing.updateDisplay: invalid data.total: ' +
                             data.total);
                    totalWin = this.getText('errTotalWin');
                    err = true;
                }
            }

            if (data.partials) {
                if (!J.isArray(data.partials)) {
                    node.err('Web3Signing error, invalid partials win: ' +
                             data.partials);
                }
                else {
                    preWin = data.partials.join(' + ');
                }
            }

            if ('undefined' !== typeof data.totalRaw) {
                if (preWin) preWin += ' = ';
                else preWin = '';
                preWin += data.totalRaw;

                // Get Exchange Rate.
                ex = 'undefined' !== typeof data.exchangeRate ?
                    data.exchangeRate : node.game.settings.EXCHANGE_RATE;

                // If we have an exchange rate, check if we have a totalRaw.
                if ('undefined' !== typeof ex) preWin += '*' + ex;

                // Need to compute total manually.
                if ('undefined' === typeof totalWin) {
                    totalRaw = J.isNumber(data.totalRaw, 0);
                    totalWin = parseFloat(ex*totalRaw).toFixed(2);
                    totalWin = J.isNumber(totalWin, 0);
                    if (totalWin === false) {
                        node.err('Web3Signing.updateDisplay: invalid : ' +
                                 'totalWin calculation from totalRaw.');
                        totalWin = this.getText('errTotalWin');
                        err = true;
                    }
                }
                if (!err) totalWin = preWin + ' = ' + totalWin;
            }

            if (!err) totalWin += ' ' + this.totalWinCurrency;
        }

        exitCode = data.exit;
        if ('string' !== typeof exitCode) {
            node.err('Web3Signing error, invalid exit code: ' + exitCode);
            exitCode = this.getText('errExitCode');
        }

        totalHTML = this.totalWinInputElement;
        exitCodeHTML = this.web3SignInputElement;

        if (totalHTML && this.showTotalWin) {
            totalHTML.value = totalWin;
        }

        if (exitCodeHTML && this.showWeb3Sign) {
            exitCodeHTML.value = exitCode;
        }
    };

    function getExitCode () {
        return this.exitCodeInputElement ? this.exitCodeInputElement.value : this._exitCode;
    }

    function getTotalWin() {
        return this.totalWinInputElement ? this.totalWinInputElement.value : this._totalWin;
    }

})(node);
