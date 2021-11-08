const QueueTask = require('../index');
const rows = new Array(99).fill(1).map((v, index) => (() => new Promise((r) => {
    let t = parseInt(Math.random() * 1000) + 400;
    setTimeout(() => r(t), t);
})));
(new QueueTask(rows, {
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
