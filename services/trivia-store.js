import { query, update } from 'mu';
import uuidv5 from 'uuid/v5';

const PREFIX_QUESTIONS = "http://mu.semte.ch/data/questions/";
const PREFIX_Q_CATEGORIES = "http://mu.semte.ch/data/question/categories/";
const PREFIX_PRE_EXT_TRIVIA = "http://mu.semte.ch/vocabularies/ext/trivia";
const PREFIX_PRE_CORE = "http://mu.semte.ch/vocabularies/core/";

const NAMESPACE = "7d96e81d-bfad-4e08-b820-1d5ff04b1972";

export class TriviaStore {

    // DONE
    async addQuestion(question) {
        let questionId = uuidv5(question.question, NAMESPACE);
        let categoryId = uuidv5(question.category, NAMESPACE);

        let q = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX vet: <${PREFIX_PRE_EXT_TRIVIA}>
        PREFIX vtc: <${PREFIX_PRE_EXT_TRIVIA}/category>
        PREFIX vc:  <${PREFIX_PRE_CORE}>

        INSERT DATA {
            GRAPH <http://mu.semte.ch/application> { 
                <${PREFIX_QUESTIONS}${questionId}> 
                    rdf:type vet:Trivia ; 
                    vc:uuid "${questionId}" ;
                    vet:category <${PREFIX_Q_CATEGORIES}${questionId}> ;
                    vet:type "${question.type}" ;
                    vet:difficulty "${question.difficulty}" ;
                    vet:question "${question.question}" ;
                    vet:correct_answer "${question.correct_answer}" ;
                    ${(question.incorrect_answers.map((answer) => `vet:incorrect_answer "${answer}"`).join(" ; ") + " .")}

                <${PREFIX_Q_CATEGORIES}${questionId}>
                    rdf:type vtc:Category ;
                    vc:uuid "${categoryId}" ;
                    vtc:name "${question.category}" .
            }
        }
        `
        await update(q);
        return questionId;
    }

    addQuestions(questions) {
        questions.forEach(question => {
            this.addQuestion(question);
        });
    }

    // TODO add params {type, category, difficulty, ...}
    async getAmountQuestions(params) {
        const { type, category, difficulty } = params
        let q = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX vet: <${PREFIX_PRE_EXT_TRIVIA}>
        PREFIX vc: <${PREFIX_PRE_CORE}>
        
        SELECT COUNT(?uri) AS ?count
        WHERE {
            GRAPH <http://mu.semte.ch/application> {
                ?uri rdf:type vet:Trivia .
                ?uri vet:category ?curi .
                ?curi vc:uuid ?cid .
                ?uri vet:type ?type .
                ?uri vet:difficulty ?difficulty .
                ${type ? `FILTER(?type = "${type}") .` : ""}
                ${difficulty ? `FILTER(?difficulty = "${difficulty}") .` : ""}
                ${category ? `FILTER(?cid = "${category}")` : ""} 
            }
        }
        `
        let res = await query(q);
        return res.results.bindings[0].count.value;
    }
}