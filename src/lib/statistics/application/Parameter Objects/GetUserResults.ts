import { CompletedQuizQueryParams } from "../DTOs/CompletedQuizQueryParams";

export class GetUserResults {
    constructor(public readonly userId: string, public readonly criteria: CompletedQuizQueryParams){}
}