
const TASK_FLAG = {
  TASK_RUNING: 1,
  TASK_COMPLETE: 2
};

module.exports = class AsyncQueue {
  constructor(data, config) {
    this.data = [].concat(data);
    this.config = Object.assign({
      process: () => arguments,
      perror: () => { },
      limit: 1
    }, config && typeof config == 'object' ? config : (typeof config == "function" ? { process: config } : (typeof config == "number" ? { limit: config } : null)));
    this.taskFlag = {};
    this.cursor = 0;
  }
  run(data) {
    if (data && Array.isArray(data)) this.data = [].concat(data), this.init();
    let self = this;
    let limit = this.data.length > 0 ? Math.min(Number(this.config.limit), this.data.length) : 0;
    let _process = this.config.process, perror = this.config.perror, retry = this.config.retry;
    return new Promise(function (resolve, reject) {
      if (!self.data.length) return resolve();
      let next = (taskId) => {
        if (self.cursor >= self.data.length)
          return !!Object.getOwnPropertyNames(self.taskFlag).find(tid => self.taskFlag[tid] === TASK_FLAG.TASK_RUNING) ? resolve(self.cursor) : null;
        let nCursor = self.cursor;
        let item = self.data[self.cursor++];
        self.taskFlag[taskId] = TASK_FLAG.TASK_RUNING;
        let start = () => { self.taskFlag[taskId] = TASK_FLAG.TASK_COMPLETE, next(taskId); };
        let execute = () => { promise.then(start).catch(onerr); };
        let onerr = (err) => { perror(err, tryCount, item, nCursor, self.data), tryCount++ < retry ? execute() : start(); };
        let promise, fn, tryCount = 0;
        try {
          fn = typeof _process === 'function' ? _process(item, nCursor, self.data) : item;
          promise = typeof fn == 'function' ? fn() : (fn && typeof fn.then == 'function' ? fn : (new Promise((resolve) => resolve(fn))));
          if (promise.then) execute();
          else start();
        } catch (error) {
          onerr(error);
        }
      }
      for (let i = 0; i < limit; i++)next(i);
    });
  }
  rerun() {
    this.taskFlag = {};
    this.cursor = 0;
    return this.run();
  }
};