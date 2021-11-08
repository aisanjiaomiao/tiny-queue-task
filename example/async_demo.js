const QueueTask = require('../index');
const rows = new Array(99).fill(1).map((v, index) => index + 10);
const waitMs = (t) => new Promise((r) => setTimeout(r, t));
(new QueueTask(rows, {
    limit: 5,
    retry: 3,
    async process(val, index, arr) {
        let t = parseInt(Math.random() * 1000) + 400;
        // let t= parseInt(Math.random() * 1000)+1000;
        console.log("run ===>", index, ":", val, " wait(ms)", t,);
        await waitMs(t);
        console.log("end ----", index, ":", val, " wait(ms)", t);
    },
    perror: function (err, count, val, index, arr) {
        console.log("Err index:", index, err, count, val);
    }
})).run();
