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
        let triviaId = uuidv5(trivia.question, NAMESPACE);
        let categoryId = uuidv5(trivia.category, NAMESPACE);

        let q = `
        PREFIX vet: <${PREFIX_PRE_EXT_TRIVIA}>
        PREFIX vtc: <${PREFIX_PRE_EXT_TRIVIA}/category>
        PREFIX vc:  <${PREFIX_PRE_CORE}>

        INSERT DATA {
            GRAPH <http://mu.semte.ch/application> { 
                <${PREFIX_TRIVIAS}${triviaId}> 
                    a vet:Trivia ; 
                    vc:uuid "${triviaId}" ;
                    vet:category <${PREFIX_Q_CATEGORIES}${triviaId}> ;
                    vet:type "${trivia.type}" ;
                    vet:difficulty "${trivia.difficulty}" ;
                    vet:question "${trivia.question}" ;
                    vet:correct_answer "${trivia.correct_answer}" ;
                    ${(trivia.incorrect_answers.map((answer) => `vet:incorrect_answer "${answer}"`).join(" ; ") + " .")}

                <${PREFIX_Q_CATEGORIES}${categoryId}>
                    a vtc:Category ;
                    vc:uuid "${categoryId}" ;
                    vtc:name "${trivia.category}" .
            }
        }
        `
        await update(q);
        return triviaId;
    }

    async addTrivias(trivias) {
        for(let trivia of trivias ) {
            await this.addTrivia(trivia);
        }
    }

    // DONE
    async getCount() {
        let q = `
        PREFIX vet: <${PREFIX_PRE_EXT_TRIVIA}>
        
        SELECT COUNT(?s) AS ?count
        WHERE {
          ?s a vet:Trivia
        }
        `
        let res = await query(q);
        return res.results.bindings[0].count.value;
    }

    // TODO clear the db
    async clearDB() {
        let q = `
        DELETE
        WHERE {
            GRAPH <http://mu.semte.ch/application> { 
                ?s ?p ?o
            }
        }
        `
        await query(q);
    }
}