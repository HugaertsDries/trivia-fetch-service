var CronJob = require('cron').CronJob;

import { app, errorHandler } from "mu";
import { OpenTDBService } from "./services/opentdb";
import { TriviaStore } from "./services/trivia-store";

const openTDBService = new OpenTDBService();
const store = new TriviaStore();

app.get('/add-trivia', function (req, res) {
    openTDBService.getTrivia({ amount: 50 }).then((data) => {
    store.addTrivias(data).then(() => {
        res.send("Successfully added new trivias to the store")
        });
    });
});

app.get('/trivia-count', function (req, res) {
    store.getTriviaCount(req.query).then((data) => {
        res.send(data);
    });
});

// --- SCHEDULED SERVER TASKS ---   

var job = new CronJob('* * * * * *', function() {
    openTDBService.getTrivia({ amount: 50 }).then((data) => {
        store.addTrivias(data).then(() => {
            console.log("Successfully added new trivias to the store");
        });
    });
});

job.start();


app.use(errorHandler);