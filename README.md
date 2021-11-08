# tiny-queue-task

[![npm](https://img.shields.io/npm/v/tiny-queue-task.svg)](https://www.npmjs.com/package/tiny-queue-task) 

This library can be used in the **NodeJs**, **Browser** and **Espruino** , but platform need support `Promise` or `async/await` only.

## Installation

```sh
npm install tiny-queue-task
```

## How to use

`require` the library

```js
const QueueTask = require("tiny-queue-task");
```

create an tiny queue task

```js
const array=[1,2,3,4,5,6,7....]
const q=new QueueTask(array,{
  process:function (val, index, arr) {
    ...
  }
});
q.run();

```

## Parameters

`new TinyQueueTask(array,[options])`

### array

### options

This library support follow options:

- `process`: A function that will be called when a process ( Callback(cursorValue, cursorIndex, originalArray) )
- `perror`: A function that will be called when on error ( Callback(Error, tryCount, cursorValue, cursorIndex, originalArray) )
- `limit`: A number set task max length ( Default: 1 )
- `retry`: A number set task retry count ( Default: 0 )

## Methods
 

### `q.run([array])`

run tasks

if `array` is defined, reset original array value and run tasks

### `q.rerun()`

reset internal parameters and run

## example

### simple run :

```js
let q = new QueueTask(array, {
  limit: 5,
  process: function (val, index, arr) {
    return new Promise((r) => {
      // processing
      // ......
      r();
    });
  },
});
q.run();

// or

let q = new QueueTask([], {
  limit: 5,
  process: function (val, index, arr) {
    return new Promise((r) => {
      // processing
      // ......
      r();
    });
  },
});
q.run(array);
```

### normal demo :

I tested it in my espruino board( ESP32 / ESP8266 ). It's OK

```js
let q = new QueueTask(array, {
  limit: 5,
  process: function (val, index, arr) {
    return new Promise((r) => {
      let t = parseInt(Math.random() * 1000) + 400;
      console.log("run ===>", index, ":", val, " wait(ms)", t);
      setTimeout(() => {
        console.log("end ----", index, ":", val, " wait(ms)", t);
        r();
      }, t);
    });
  },
});
q.run();
```

### async function :

```js
new QueueTask(array, {
  limit: 5,
  async process(val, index, arr) {
    let t = parseInt(Math.random() * 1000) + 400;
    console.log("run ===>", index, ":", val, " wait(ms)", t);
    await customProcess(t);
    console.log("end ----", index, ":", val, " wait(ms)", t);
  },
}).run();
```

### retry :

```js
(new QueueTask(array, {
    limit: 3,
    retry: 3,//<===
    async process(val, index, arr) {
        let t = parseInt(Math.random() * 1000) + 400; 
        console.log("run ===>", index, ":", val, " wait(ms)", t,);
        await waitMs(t);
        throw ("Err ----" + index + ":" + val + " wait(ms):" + t);
    },
    perror: function (err, tryCount, val, index, arr) { 
        console.log(err, tryCount, val, index, arr);
    }
})).run();
```

### PromiseArray

```js
(new QueueTask(promiseArray, {
    limit: 5,
    retry: 3,
    async process(promise, index, arr) {
        console.log("run ===>", index, ":", val,);
        let t = await promise();
        console.log("end ----", index, ":", val, " wait(ms)", t);
    },
    perror: function (err, count, val, index, arr) {
        console.log("Err index:", index, err, count, val);
    }
})).run();
```