////Interfaces
//Interface for queue item.
interface Iqueue {
	//callback must be a function, but may return anything
	callback: () => any
	//condition must be a function and must return true or false
	condition: () => boolean,
}
////Classes
//This is the "Wait" class.
//We use class instead of namespace because that allows the creation of individual queues.
class Wait {
	//Minimum ms between checks
	//Defaults to 2 checks per standard 60 fps frame
	private checkTime: number = 8;
	//Getter for checkTime
	public getCheckTime() {
		return this.checkTime;
	}
	//Setter for checkTime
	public setCheckTime(time: number = 8) {
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
	}
	//The queue of tasks, a list of tasks following the "Iqueue" format.
	private queue: Iqueue[] = [];
	//The timeout handle ensures that we can stop the queue at any time.
	private timeoutHandle: number;
	//The main function for this class. Wait takes a queue item and tests the condition.
	//If the condition returns true then the callback is called and the next item in the queue (if any) is called.
	private wait(queueItem: Iqueue) {
		if (queueItem.condition()) {
			queueItem.callback();
			//Remove current item and start next queued element.
			this.queue.splice(0, 1);
			if (this.queue.length > 0) {
				this.wait(this.queue[0]);
			}
		} else {
			clearTimeout(this.timeoutHandle);
			this.timeoutHandle = setTimeout(() =>
				this.wait(queueItem)
				, this.checkTime);
		}
	}
	//Registers queue items for the queue.
	//Notice that this doesn't start the execution of the queue.
	register(callback: () => any): Wait;
	register(callback: () => any, condition: () => boolean): Wait;
	public register(callback: () => any, condition: () => boolean = function () { return true; }) {
		this.queue.push({
			condition: condition,
			callback: callback
		});
		return this;
	}
	//This starts the execution of the queue.
	//Notice that this will clear the timeout handle to ensure only one process is running.
	//Returns true if a queue was started and false if no queue items exists.
	public start(): boolean {
		if (this.queue.length > 0) {
			clearTimeout(this.timeoutHandle);
			this.wait(this.queue[0]);
			return true;
		}
		return false;
	}
	//Pauses the execution of the queue.
	//This also clears the queue if the "clearQueue" parameter is set to true.
	public stop(clearQueue: boolean = false) {
		clearTimeout(this.timeoutHandle);
		if (clearQueue === true) {
			this.queue = [];
		}
	}
}