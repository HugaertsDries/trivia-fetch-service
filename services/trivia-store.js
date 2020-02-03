import { query, update } from 'mu';

import uuidv5 from 'uuid/v5';

const PREFIX_TRIVIAS = "http://mu.semte.ch/data/trivias/";
const PREFIX_Q_CATEGORIES = "http://mu.semte.ch/data/trivia/categories/";
const PREFIX_PRE_EXT_TRIVIA = "http://mu.semte.ch/vocabularies/ext/trivia";
const PREFIX_PRE_CORE = "http://mu.semte.ch/vocabularies/core/";

const NAMESPACE = "7d96e81d-bfad-4e08-b820-1d5ff04b1972";

export class TriviaStore {

    // DONE
    async addTrivia(trivia) {
        let triviaId = uuidv5(trivia.trivia, NAMESPACE);
        let categoryId = uuidv5(trivia.category, NAMESPACE);

        let q = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX vet: <${PREFIX_PRE_EXT_TRIVIA}>
        PREFIX vtc: <${PREFIX_PRE_EXT_TRIVIA}/category>
        PREFIX vc:  <${PREFIX_PRE_CORE}>

        INSERT DATA {
            GRAPH <http://mu.semte.ch/application> { 
                <${PREFIX_TRIVIAS}${triviaId}> 
                    rdf:type vet:Trivia ; 
                    vc:uuid "${triviaId}" ;
                    vet:category <${PREFIX_Q_CATEGORIES}${triviaId}> ;
                    vet:type "${trivia.type}" ;
                    vet:difficulty "${trivia.difficulty}" ;
                    vet:trivia "${trivia.trivia}" ;
                    vet:correct_answer "${trivia.correct_answer}" ;
                    ${(trivia.incorrect_answers.map((answer) => `vet:incorrect_answer "${answer}"`).join(" ; ") + " .")}

                <${PREFIX_Q_CATEGORIES}${triviaId}>
                    rdf:type vtc:Category ;
                    vc:uuid "${categoryId}" ;
                    vtc:name "${trivia.category}" .
            }
        }
        `
        await update(q);
        return triviaId;
    }

    addTrivias(trivias) {
        trivias.forEach(trivia => {
            this.addTrivia(trivia);
        });
    }

    // TODO add params {type, category, difficulty, ...}
    async getAmountTrivias(params) {
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