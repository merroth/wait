interface Iqueue {
    callback: () => any;
    condition: () => boolean;
}
declare class Wait {
    private logErrors;
    displayErrors(v: boolean): this;
    err: (v: boolean) => this;
    private log(message?);
    private checkTime;
    getCheckTime(): number;
    setCheckTime(time?: number): Wait;
    t: (time?: number) => Wait;
    private queue;
    private timeoutHandle;
    private wait(queueItem);
    register(callback: () => any): Wait;
    register(callback: () => any, condition: boolean): Wait;
    register(callback: () => any, condition: () => boolean): Wait;
    r: {
        (callback: () => any): Wait;
        (callback: () => any, condition: boolean): Wait;
        (callback: () => any, condition: () => boolean): Wait;
    };
    start(): Wait;
    stop(): Wait;
    stop(clearQueue: boolean): Wait;
}
