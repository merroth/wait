////Classes
/**
 * We use class instead of namespace because that allows the creation of individual queues.
 * @class Wait
 */
var Wait = (function () {
    /**
     * Creates an instance of Wait.
     * @returns {Wait}
     */
    function Wait() {
        /**
         * Switch for handling events synchronously.
         * If synchronousHandling is false then we will always wait at least 'checkTime' milliseconds between each execution.
         */
        this.synchronousHandling = true;
        /**
         * Shorthand for 'setSynchronousHandling'.
         */
        this.sync = this.setSynchronousHandling;
        /**
         * Switch for displaying errors.
         * Default is true.
         */
        this.logErrors = true;
        /**
         * Shorthand for 'displayErrors'.
         */
        this.err = this.displayErrors;
        /**
         * Minimum ms between checks.
         * Defaults to 2 checks per standard 60 fps frame.
         */
        this.checkTime = 8;
        /**
         * Shorthand for 'setCheckTime'.
         */
        this.t = this.setCheckTime;
        /**
         * The queue of tasks.
         * A list of tasks following the "Iqueue" format.
         */
        this.queue = [];
        /**
         * Shorthand for register.
         */
        this.r = this.register;
    }
    /**
     * Setter for 'synchronousHandling'.
     * Takes a boolean argument.
     * @param {boolean} v
     * @returns {Wait}
     */
    Wait.prototype.setSynchronousHandling = function (v) {
        if (typeof v != "boolean") {
            this.log("'setSynchronousHandling' only takes type boolean arguments, argument of type '" + typeof v + "' is not allowed");
            return this;
        }
        this.synchronousHandling = v;
        return this;
    };
    /**
     * Setter for 'logErrors'.
     * Takes a boolean argument.
     * @param {boolean} v
     * @returns {Wait}
     */
    Wait.prototype.displayErrors = function (v) {
        if (typeof v != "boolean") {
            this.log("'displayErrors' only takes type boolean arguments, argument of type '" + typeof v + "' is not allowed");
            return this;
        }
        this.logErrors = v;
        return this;
    };
    /**
     * Log function.
     * Logs warning messages to the console.
     */
    Wait.prototype.log = function (message) {
        if (message === void 0) { message = ""; }
        if (this.logErrors === true) {
            console.warn(message);
        }
    };
    /**
     * Getter for 'checkTime'.
     * @returns {number}
     */
    Wait.prototype.getCheckTime = function () {
        return this.checkTime;
    };
    /**
     * Setter for 'checkTime'.
     * Takes a millisecond argument.
     * @param {number} [time=this.checkTime]
     * @returns {Wait}
     */
    Wait.prototype.setCheckTime = function (time) {
        if (time === void 0) { time = this.checkTime; }
        //Time must be a number
        if (typeof time != "number") {
            this.log("'setCheckTime' only takes type 'number' arguments, argument of type '" + typeof time + "' is not allowed");
            return this;
        }
        //Time must be greater than, or equal to, 0
        if (time < 0) {
            this.log("'setCheckTime' cannot take negative values. argument '" + time.toString() + "' is not allowed");
            return this;
        }
        //Set time
        this.checkTime = time;
        //Return this for chaining
        return this;
    };
    /**
     * The main function for this class.
     * Wait takes a queue item and tests the condition.
     * If the condition returns true then the callback is called and the next item in the queue (if any) is called.
     * @private
     * @param {Iqueue} queueItem
     */
    Wait.prototype.wait = function (queueItem) {
        var _this = this;
        //Check current queueItem condition
        if (queueItem.condition()) {
            //If condition passed, fire callback
            queueItem.callback();
            //Remove current item
            this.queue.splice(0, 1);
            //If the queue contains more items
            if (this.queue.length > 0) {
                //Check for synchronous handling of "queueItems"
                if (this.synchronousHandling === true) {
                    //Fire next event synchronously to accomodate instantly passed conditions
                    this.wait(this.queue[0]);
                }
                else {
                    //Make sure only one instance of the queue is running by clearing our timeout
                    clearTimeout(this.timeoutHandle);
                    //Set a new timeout to test the next "queueItem" in 'checkTime' milliseconds
                    this.timeoutHandle = setTimeout(function () {
                        return _this.wait(_this.queue[0]);
                    }, this.checkTime);
                }
            }
        }
        else {
            //Make sure only one instance of the queue is running by clearing our timeout
            clearTimeout(this.timeoutHandle);
            //Set a new timeout to test the next "queueItem" in 'checkTime' milliseconds
            this.timeoutHandle = setTimeout(function () {
                return _this.wait(queueItem);
            }, this.checkTime);
        }
    };
    Wait.prototype.register = function (callback, condition) {
        if (condition === void 0) { condition = function () { return true; }; }
        //Fail gracefully if parameters is of the wrong type
        if (typeof callback != "function") {
            this.log("'register' argument 'callback' must be of type 'function'");
            return this;
        }
        if (typeof condition != "function") {
            if (typeof condition == "boolean") {
                if (condition === true) {
                    condition = function () { return true; };
                }
                else {
                    this.log("'register' argument 'condition' of type 'boolean' must be true");
                    return this;
                }
            }
            else {
                this.log("'register' argument 'condition' must be of type 'function' or type 'boolean', argument of type '" + typeof condition + "' is not allowed");
                return this;
            }
        }
        //Test that condition returns a boolean value
        if (typeof condition() !== "boolean") {
            this.log("'register' argument 'condition' must evaluate to type 'boolean', evaluation of type '" + (typeof condition()) + "' is not allowed");
            return this;
        }
        //Push the new queueItem to the queue
        this.queue.push({
            condition: condition,
            callback: callback
        });
        //return this for chaining
        return this;
    };
    /**
     * This starts the execution of the queue.
     * Notice that this will clear the timeout handle to ensure only one process is running.
     * Returns true if a queue was started and false if no queue items exists.
     * @returns {Wait}
     */
    Wait.prototype.start = function () {
        if (this.queue.length > 0) {
            clearTimeout(this.timeoutHandle);
            this.wait(this.queue[0]);
            return this;
        }
        this.log("'start' cannot activate on an empty queue. 'register' a task first");
        return this;
    };
    /**
     * Pauses the execution of the queue.
     * This also clears the queue if the "clearQueue" parameter is set to true.
     * @param {boolean} [clearQueue=false]
     * @returns {Wait}
     */
    Wait.prototype.stop = function (clearQueue) {
        if (clearQueue === void 0) { clearQueue = false; }
        clearTimeout(this.timeoutHandle);
        if (clearQueue === true) {
            this.queue = [];
        }
        return this;
    };
    return Wait;
}());