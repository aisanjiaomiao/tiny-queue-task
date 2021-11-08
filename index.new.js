const QUEUE_STATUS = { FREE: 0, RUNING: 1, };
module.exports = class Queue {
    constructor(config) {
        this.process = config.process || (() => { });
        this.error = config.error || (() => { });
        this._list = config.list || [];
        this._limit = config.limit || 3;
        this._start = config.start == true;
        this._retry = config.retry || 0;
        this._safety_lock = false;
        this.reset();
        if (this._start) this.check();
    }
    limit(limit) {
        if (!limit) return this._limit;
        let isStart = this._start;
        if (isStart) this.stop();
        this.reset();
        this._limit = limit;
        if (isStart) this.start();
    }
    reset() {
        this._processFlag = {};
        for (let i = 0; i < this._limit; i++)this._processFlag[i] = QUEUE_STATUS.FREE;
    }
    push() {
        if (!arguments) return;
        this._safety_lock = true;
        for (let i = 0; i < arguments.length; i++)this._list.push(arguments[i]);
        // this._list = this._list.concat(arguments);
        this._safety_lock = false;
        this.check();
    }
    check() {
        if (this._start == false || !this._list.length) return;
        let self = this;
        let next = (taskId) => {
            if (!self._list.length || self._safety_lock) return;
            self._safety_lock = true;
            let item = self._list.shift();
            self._safety_lock = false;
            self._processFlag[taskId] = QUEUE_STATUS.RUNING;
            let tryCount = 0, fn, promise;
            let start = () => { self._processFlag[taskId] = QUEUE_STATUS.FREE, self.check(); };
            let execute = () => { promise.then(start).catch(onerr); };
            let onerr = (err) => { self.error(err, item, tryCount), (tryCount++ < self._retry ? execute() : start()); };
            try {
                fn = typeof self.process === 'function' ? self.process(item) : item;
                promise = typeof fn == 'function' ? fn() : (fn && typeof fn.then == 'function' ? fn : (new Promise((resolve) => resolve(fn))));
                (promise.then ? execute : start)();
            } catch (error) {
                onerr(error);
            }
        };
        for (let k in this._processFlag)
            if (this._processFlag[k] === QUEUE_STATUS.FREE) next(k);// 存在空闲直接执行
    }
    stop() {
        this._start = false;
    }
    start() {
        this._start = true;
        this.check();
    }
    end() {
        this._list = [];
        this._start = false;
        this.reset();
    }
}