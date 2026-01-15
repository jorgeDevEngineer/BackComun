import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "../aggregates/MultiplayerSession";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { PlayerId } from "../valueObjects/playerVOs";
import { Question } from "src/lib/kahoot/domain/entity/Question";
import { MultiplayerAnswer } from "../valueObjects/multiplayerVOs";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { Answer } from "src/lib/kahoot/domain/entity/Answer";

export class MultiplayerEvaluationService {
    
    public evaluatePlayerSubmission(
        quiz: Quiz,
        session: MultiplayerSession, 
        questionId: QuestionId,
        playerId: PlayerId,
        timeUsedMs: number,
        answerIndex: number[] 
    ): void {

        if (session.hasPlayerAnsweredQuestion(questionId, playerId)){
            throw new Error("El jugador ya ha enviado una respuesta para esta pregunta.");
        }

        const question: Question = quiz.getQuestionById(questionId);
        
        // Validar que los índices estén en rango
        this.validateAnswerIndices(question, answerIndex);
        
        const isCorrect = this.isAnswerCorrect(question, answerIndex);
        const points = GameScore.create(this.calculatePoints(question, isCorrect, timeUsedMs));

        const playerEvaluation = MultiplayerAnswer.create(
            playerId, 
            questionId, 
            answerIndex, 
            isCorrect, 
            points, 
            timeUsedMs
        );

        session.addPlayerAnswer(questionId, playerEvaluation);
    }

    private validateAnswerIndices(question: Question, answerIndices: number[]): void {
        const totalAnswers = question.getAnswers().length;
        
        // Si no es tipo múltiple, solo debe haber un índice
        if (question.type.getValue() !== 'multiple' && answerIndices.length !== 1) {
            throw new Error("Esta pregunta requiere exactamente una respuesta");
        }
        
        // Validar que todos los índices estén en rango (base-0)
        for (const index of answerIndices) {
            if (index < 0 || index >= totalAnswers) {
                throw new Error(`Índice de respuesta ${index} fuera de rango`);
            }
        }
        
        // Validar que no haya duplicados
        const uniqueIndices = new Set(answerIndices);
        if (uniqueIndices.size !== answerIndices.length) {
            throw new Error("No se permiten respuestas duplicadas");
        }
    }

    private isAnswerCorrect(question: Question, answerIndices: number[]): boolean {
        if (answerIndices.length === 0) {
            return false; // No respondió nada
        }
        
        const answers = question.getAnswers();
        const questionType = question.type.getValue();
        
        if (questionType === 'multiple') {
            // Tipo multiple: verificar que se seleccionaron TODAS las correctas y SOLO las correctas
            return this.areAllAndOnlyCorrectAnswersSelectedOptimized(answers, answerIndices);
        } else {
            // Tipo quiz/verdadero-falso: exactamente una respuesta correcta
            if (answerIndices.length !== 1) {
                return false;
            }
            return answers[answerIndices[0]].isCorrect.getValue();
        }
    }
    
    // Versión alternativa más eficiente usando conjuntos
    private areAllAndOnlyCorrectAnswersSelectedOptimized(
        answers: Answer[], 
        selectedIndices: number[]
    ): boolean {
        // Obtener índices de todas las respuestas correctas
        const correctIndices = new Set<number>();
        
        for (let i = 0; i < answers.length; i++) {
            if (answers[i].isCorrect.getValue()) {
                correctIndices.add(i);
            }
        }
        
        // Convertir selectedIndices a Set para comparación eficiente
        const selectedSet = new Set(selectedIndices);
        
        // Verificar que los conjuntos sean iguales
        if (selectedSet.size !== correctIndices.size) {
            return false;
        }
        
        // Verificar que todos los elementos de selectedSet estén en correctIndices
        for (const index of selectedSet) {
            if (!correctIndices.has(index)) {
                return false;
            }
        }
        
        return true;
    }
    
    private calculatePoints(question: Question, isCorrect: boolean, timeUsed: number): number {
        if (!isCorrect) {
            return 0;
        }
        
        const timeLimit: number = question.timeLimit.getValue();
        const basePoints: number = question.points.getValue();
        
        // Convertir ms a segundos
        const timeUsedSeconds = timeUsed / 1000;
        
        // Asegurar que timeUsed no exceda timeLimit
        const effectiveTimeUsed = Math.min(timeUsedSeconds, timeLimit);
        const timeLeft = Math.max(0, timeLimit - effectiveTimeUsed);
        
        const timeLeftRatio: number = timeLeft / timeLimit;
        const speedMultiplier: number = 1 + Math.pow(timeLeftRatio, 1.5) * 0.8;
        
        return Math.round((basePoints * speedMultiplier) / 10) * 10;
    }
}