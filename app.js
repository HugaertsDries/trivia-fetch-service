var CronJob = require('cron').CronJob;

import { app, errorHandler } from "mu";
import { OpenTDBService } from "./services/opentdb";
import { TriviaStore } from "./services/trivia-store";

const openTDBService = new OpenTDBService();
const store = new TriviaStore();

/* --- API --- */

app.get('/add-trivia', function (req, res) {
    openTDBService.getTrivia({ amount: 50 }).then((data) => {
    store.addTrivias(data).then(() => {
        res.send("Successfully added new trivias to the store")
        });
    });
});

app.get('/trivia-count', function (req, res) {
    store.getCount(req.query).then((data) => {
        res.send(data);
    });
});

app.get('/clear-store', function (req, res) {
    store.clearDB().then(() => res.send("Successfully cleared the store"));
})

/* --- SCHEDULED SERVER TASKS --- */  

var job = new CronJob('0 */10 * * * *', function() {
    openTDBService.getTrivia({ amount: 50 }).then((data) => {
        store.addTrivias(data).then(() => {
            console.log("Successfully added new trivias to the store");
        });
    });
});

// to start the cron jobs
job.start();

app.use(errorHandler);