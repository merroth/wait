////Interfaces
//Interface for queue item.
interface Iqueue {
	//callback must be a function, but may return anything
	callback: () => any
	//condition must be a function and must return true or false
	condition: () => boolean
}
////Classes
/**
 * We use class instead of namespace because that allows the creation of individual queues.
 * @class Wait
 */
class Wait {
	/**
	 * Creates an instance of Wait.
	 * @returns {Wait}
	 */
	constructor () {
		
	}
	/**
	 * Switch for handling events synchronously.
	 * If synchronousHandling is false then we will always wait at least 'checkTime' milliseconds between each execution.
	 */
	private synchronousHandling: boolean = true;
	/**
	 * Setter for 'synchronousHandling'.
	 * Takes a boolean argument.
	 * @param {boolean} v
	 * @returns {Wait}
	 */
	public setSynchronousHandling(v: boolean): Wait {
		if (typeof v != "boolean") {
			this.log("'setSynchronousHandling' only takes type boolean arguments, argument of type '" + typeof v + "' is not allowed");
			return this;
		}
		this.synchronousHandling = v;
		return this;
	}
	/**
	 * Shorthand for 'setSynchronousHandling'.
	 */
	public sync = this.setSynchronousHandling;
	/**
	 * Switch for displaying errors.
	 * Default is true.
	 */
	private logErrors: boolean = true;
	/**
	 * Setter for 'logErrors'.
	 * Takes a boolean argument.
	 * @param {boolean} v
	 * @returns {Wait}
	 */
	public displayErrors(v: boolean): Wait {
		if (typeof v != "boolean") {
			this.log("'displayErrors' only takes type boolean arguments, argument of type '" + typeof v + "' is not allowed");
			return this;
		}
		this.logErrors = v;
		return this;
	}
	/**
	 * Shorthand for 'displayErrors'.
	 */
	public err = this.displayErrors;
	/**
	 * Log function.
	 * Logs warning messages to the console.
	 */
	private log(message: string = "") {
		if (this.logErrors === true) {
			console.warn(message);
		}
	}
	/**
	 * Minimum ms between checks.
	 * Defaults to 2 checks per standard 60 fps frame.
	 */
	private checkTime: number = 8;
	/**
	 * Getter for 'checkTime'.
	 * @returns {number}
	 */
	public getCheckTime() {
		return this.checkTime;
	}
	/**
	 * Setter for 'checkTime'.
	 * Takes a millisecond argument.
	 * @param {number} [time=this.checkTime]
	 * @returns {Wait}
	 */
	public setCheckTime(time: number = this.checkTime): Wait {
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
	}
	/**
	 * Shorthand for 'setCheckTime'.
	 */
	public t = this.setCheckTime;
	/**
	 * The queue of tasks.
	 * A list of tasks following the "Iqueue" format.
	 */
	private queue: Iqueue[] = [];
	/**
	 * The timeout handle ensures that we can stop the queue at any time.
	 */
	private timeoutHandle: number;
	/**
	 * The main function for this class.
	 * Wait takes a queue item and tests the condition.
	 * If the condition returns true then the callback is called and the next item in the queue (if any) is called.
	 * @private
	 * @param {Iqueue} queueItem
	 */
	private wait(queueItem: Iqueue) {
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
				} else {
					//Make sure only one instance of the queue is running by clearing our timeout
					clearTimeout(this.timeoutHandle);
					//Set a new timeout to test the next "queueItem" in 'checkTime' milliseconds
					this.timeoutHandle = setTimeout(() =>
						this.wait(this.queue[0])
						, this.checkTime);
				}
			}
		} else {
			//Make sure only one instance of the queue is running by clearing our timeout
			clearTimeout(this.timeoutHandle);
			//Set a new timeout to test the next "queueItem" in 'checkTime' milliseconds
			this.timeoutHandle = setTimeout(() =>
				this.wait(queueItem)
				, this.checkTime);
		}
	}
	/**
	 * Registers queue items for the queue.
	 * Notice that this doesn't start the execution of the queue, it simply adds items to it.
	 * Assumes all conditions to have been met immediately.
	 * @param {() => any} callback
	 * @returns {Wait}
	 */
	register(callback: () => any): Wait;
	/**
	 * Registers queue items for the queue.
	 * Notice that this doesn't start the execution of the queue, it simply adds items to it.
	 * Uses a boolean as a condition.
	 * Change the condition variable in a previous step or outside wait queue or simply make it "true" to fire the callback
	 * @param {() => any} callback
	 * @param {boolean} condition
	 * @returns {Wait}
	 */
	register(callback: () => any, condition: boolean): Wait;
	/**
	 * Registers queue items for the queue.
	 * Notice that this doesn't start the execution of the queue, it simply adds items to it.
	 * Define a function as the condition.
	 * The condition must return a boolean value.
	 * @param {() => any} callback
	 * @param {() => boolean} condition
	 * @returns {Wait}
	 */
	register(callback: () => any, condition: () => boolean): Wait;
	public register(callback: () => any, condition: any = function () { return true; }): Wait {
		//Fail gracefully if parameters is of the wrong type
		if (typeof callback != "function") {
			this.log("'register' argument 'callback' must be of type 'function'");
			return this;
		}
		if (typeof condition != "function") {
			if (typeof condition == "boolean") {
				if (condition === true) {
					condition = function () { return true; }
				} else {
					this.log("'register' argument 'condition' of type 'boolean' must be true");
					return this;
				}
			} else {
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
	}
	/**
	 * Shorthand for register.
	 */
	public r = this.register;
	/**
	 * This starts the execution of the queue.
	 * Notice that this will clear the timeout handle to ensure only one process is running.
	 * Returns true if a queue was started and false if no queue items exists.
	 * @returns {Wait}
	 */
	public start(): Wait {
		if (this.queue.length > 0) {
			clearTimeout(this.timeoutHandle);
			this.wait(this.queue[0]);
			return this;
		}
		this.log("'start' cannot activate on an empty queue. 'register' a task first");
		return this;
	}
	/**
	 * Pauses the execution of the queue.
	 * @returns {Wait}
	 */
	stop(): Wait;
	/**
	 * Pauses the execution of the queue.
	 * This also clears the queue if the "clearQueue" parameter is set to true.
	 * @param {boolean} clearQueue
	 * @returns {Wait}
	 */
	stop(clearQueue: boolean): Wait;
	/**
	 * Pauses the execution of the queue.
	 * This also clears the queue if the "clearQueue" parameter is set to true.
	 * @param {boolean} [clearQueue=false]
	 * @returns {Wait}
	 */
	public stop(clearQueue: boolean = false): Wait {
		clearTimeout(this.timeoutHandle);
		if (clearQueue === true) {
			this.queue = [];
		}
		return this;
	}
}

