import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { MultiplayerAnswer } from "src/lib/multiplayer/domain/valueObjects/multiplayerVOs";
import { PlayerId } from "src/lib/multiplayer/domain/valueObjects/playerVOs";
import { Optional } from "../../../shared/Type Helpers/Optional";

type questionData = {
  questionIndex: number;
  questionText: string;
  isCorrect: boolean;
  answerText: string[];
  answerMediaId: string[];
  timeTakenMs: number;
};

export type MultiQuizPersonalResult = {
  kahootId: string;
  title: string;
  userId: string;
  finalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  averageTimeMs: number;
  rankingPosition: number;
  questionResults: questionData[];
};

function getAnswerTextOrMedia(questionResults: MultiplayerAnswer, quiz: Quiz) {
  const resultsText: string[] = [];
  const resultsMedia: string[] = [];
  let isText: boolean = false;
  const questionId = questionResults.getQuestionId();
  const question = quiz.getQuestionById(questionId);
  if (!question) {
    throw new Error(
      `Question with ID ${questionId.getValue()} not found in Quiz ${quiz.id.getValue()}`
    );
  }
  const answersIndex = questionResults.getAnswerIndex();
  if (Array.isArray(answersIndex) && answersIndex.length == 0) {
    return new Optional();
  }
  answersIndex.forEach((answerIndex) => {
    const answer = question.getAnswers()[answerIndex];
    if (answer.getText()) {
      isText = true;
      resultsText.push(answer.getText()!.getValue());
    } else if (answer.getMediaId()) {
      resultsMedia.push(answer.getMediaId()!);
    }
  });
  return new Optional({
    resultsText: resultsText,
    resultsMedia: resultsMedia,
    isText: isText,
  });
}

function calculateAverageTime(answers: MultiplayerAnswer[]): number {
  if (answers.length === 0) return 0;
  const totalTime = answers.reduce(
    (sum, answer) => sum + answer.getTimeElapsed(),
    0
  );
  return Math.floor(totalTime / answers.length);
}
