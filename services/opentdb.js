import fetch from "node-fetch";

const HOST = "https://opentdb.com/";
const TRIVIA_ENDPOINT = "api.php";
const CATEGORIES_ENDPOINT = "api_category.php";

const DEFAULT_QUERY = {
    amount: 50,
    type: "",
    difficulty: "",
    category: ""
}

export class OpenTDBService {

    /**
     * Returns list of RANDOM trivia based on the given params.
     */
    async getTrivia(params) {
        const { amount, type, difficulty, category } = params;
        let amt = amount ? amount : DEFAULT_QUERY.amount;
        let typ = type ? type : DEFAULT_QUERY.type;
        let dif = difficulty ? difficulty : DEFAULT_QUERY.difficulty;
        let cat = category ? category : DEFAULT_QUERY.category;
        let response = await fetch(`${HOST}${TRIVIA_ENDPOINT}?amount=${amt}&type=${typ}&difficulty=${dif}&category=${cat}`)
            .then((response) => response.json());
        return response.results;
    }

    /**
     * Returns list of all available trivia categories
     */
    async getCategories() {
        let response = await fetch(`${HOST}${CATEGORIES_ENDPOINT}`)
            .then((response) => response.json());
        return response.trivia_categories;
    }
}