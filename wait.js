////Classes
//This is the "Wait" class.
//We use class instead of namespace because that allows the creation of individual queues.
var Wait = (function () {
    function Wait() {
        //Switch for displaying errors. Default is true
        this.logErrors = true;
        //Minimum ms between checks
        //Defaults to 2 checks per standard 60 fps frame
        this.checkTime = 8;
        //The queue of tasks, a list of tasks following the "Iqueue" format.
        this.queue = [];
    }
    //Setter for logErrors
    Wait.prototype.displayErrors = function (v) {
        if (typeof v != "boolean") {
            this.log("'displayErrors' only takes type boolean arguments, argument of type '" + typeof v + "' is not allowed");
            return this;
        }
        this.logErrors = v;
        return this;
    };
    //Log function
    Wait.prototype.log = function (message) {
        if (message === void 0) { message = ""; }
        if (this.logErrors == true) {
            console.warn(message);
        }
    };
    //Getter for checkTime
    Wait.prototype.getCheckTime = function () {
        return this.checkTime;
    };
    //Setter for checkTime
    Wait.prototype.setCheckTime = function (time) {
        if (time === void 0) { time = 8; }
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
    //The main function for this class. Wait takes a queue item and tests the condition.
    //If the condition returns true then the callback is called and the next item in the queue (if any) is called.
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
                //Fire next event synchronously to  accomodate instantly passed conditions
                this.wait(this.queue[0]);
            }
        }
        else {
            //Make sure only one instance of the queue is running by clearing our timeout
            clearTimeout(this.timeoutHandle);
            //Set a new timeout to test the next queueItem in checkTime milliseconds
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
                if (condition == true) {
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
        //Push the new queueItem to the queue
        this.queue.push({
            condition: condition,
            callback: callback
        });
        //return this for chaining
        return this;
    };
    //This starts the execution of the queue.
    //Notice that this will clear the timeout handle to ensure only one process is running.
    //Returns true if a queue was started and false if no queue items exists.
    Wait.prototype.start = function () {
        if (this.queue.length > 0) {
            clearTimeout(this.timeoutHandle);
            this.wait(this.queue[0]);
            return this;
        }
        this.log("'start' cannot activate on an empty queue. 'register' a task first");
        return this;
    };
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
