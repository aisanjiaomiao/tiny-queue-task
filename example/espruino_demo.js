const QueueTask = require('../index');
(new QueueTask(new Array(99).fill(1).map((v, index) => index + 10), {
    limit: 5,
    retry: 3,
    process: function (val, index, arr) { 
        return new Promise((r) => {
            let t = parseInt(Math.random() * 1000) + 400;
            // let t= parseInt(Math.random() * 1000)+1000;
            console.log("run ===>", index, ":", val, " wait(ms)", t, process.memory?" free:"+ process.memory().free:"");
            setTimeout(() => {
                console.log("end ----", index, ":", val, " wait(ms)", t, process.memory?" free:"+ process.memory().free:"");
                r();
            }, t);
        });
    },
    perror: function (err, count, val, index, arr) {
        console.log("Err index:", index, err, count, val);
    }
})).run();