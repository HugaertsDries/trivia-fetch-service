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

app.get('/trivia-count', function (req, res){
    store.getTriviaCount(req.query).then((data) => {
        res.send(data);
    } );
});

app.use(errorHandler);