////Classes
//This is the "Wait" class.
//We use class instead of namespace because that allows the creation of individual queues.
var Wait = (function () {
    function Wait() {
        //Minimum ms between checks
        //Defaults to 2 checks per standard 60 fps frame
        this.checkTime = 8;
        //The queue of tasks, a list of tasks following the "Iqueue" format.
        this.queue = [];
    }
    //Getter for checkTime
    Wait.prototype.getCheckTime = function () {
        return this.checkTime;
    };
    //Setter for checkTime
    Wait.prototype.setCheckTime = function (time) {
        if (time === void 0) { time = 8; }
        //Time must be a number
        if (typeof time != "number") {
            return this;
        }
        //Time must be greater than, or equal to, 1
        if (time < 1) {
            return this;
        }
        //set time
        this.checkTime = time;
        //return this for chaining
        return this;
    };
    //The main function for this class. Wait takes a queue item and tests the condition.
    //If the condition returns true then the callback is called and the next item in the queue (if any) is called.
    Wait.prototype.wait = function (queueItem) {
        var _this = this;
        if (queueItem.condition()) {
            queueItem.callback();
            //Remove current item and start next queued element.
            this.queue.splice(0, 1);
            if (this.queue.length > 0) {
                this.wait(this.queue[0]);
            }
        }
        else {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = setTimeout(function () {
                return _this.wait(queueItem);
            }, this.checkTime);
        }
    };
    Wait.prototype.register = function (callback, condition) {
        if (condition === void 0) { condition = function () { return true; }; }
        this.queue.push({
            condition: condition,
            callback: callback
        });
        return this;
    };
    //This starts the execution of the queue.
    //Notice that this will clear the timeout handle to ensure only one process is running.
    //Returns true if a queue was started and false if no queue items exists.
    Wait.prototype.start = function () {
        if (this.queue.length > 0) {
            clearTimeout(this.timeoutHandle);
            this.wait(this.queue[0]);
            return true;
        }
        return false;
    };
    //Pauses the execution of the queue.
    //This also clears the queue if the "clearQueue" parameter is set to true.
    Wait.prototype.stop = function (clearQueue) {
        if (clearQueue === void 0) { clearQueue = false; }
        clearTimeout(this.timeoutHandle);
        if (clearQueue === true) {
            this.queue = [];
        }
    };
    return Wait;
}());
