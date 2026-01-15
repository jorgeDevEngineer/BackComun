import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { MultiplayerAnswer } from "src/lib/multiplayer/domain/valueObjects/multiplayerVOs";
import { PlayerId } from "src/lib/multiplayer/domain/valueObjects/playerVOs";
import { Optional } from "../../../shared/Type Helpers/Optional";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

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

function getAnswerTextOrMedia(
  questionResults: MultiplayerAnswer,
  quiz: Quiz
): Optional<{
  resultsText: string[];
  resultsMedia: string[];
  isText: boolean;
}> {
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
  const totalTime = answers.reduce((sum, answer) => {
    if (answer !== undefined) {
      return sum + answer.getTimeElapsed();
    } else {
      return 0;
    }
  }, 0);
  return Math.floor(totalTime / answers.length);
}

export function toMultiQuizPersonalResult(
  game: MultiplayerSession,
  quiz: Quiz,
  playerId: UserId
) {
  const plainQuiz = quiz.toPlainObject();
  const playerIdObj = PlayerId.of(playerId.value);
  const playerAnswers = game.getOnePlayerAnswers(playerIdObj);
  const questionResults: questionData[] = playerAnswers.map((answer, index) => {
    if (answer === undefined) {
      const finalQuestionIndex = game.getCurrentQuestionIndex() - 1;
      const indexDiference = finalQuestionIndex - index;
      const realIndexInQuiz = finalQuestionIndex - indexDiference;
      const question = quiz.getQuestions()[realIndexInQuiz];
      const plainQuestion = question.toPlainObject();
      return {
        questionIndex: index + 1,
        questionText: plainQuestion.text,
        isCorrect: false,
        answerText: [],
        answerMediaId: [],
        timeTakenMs: 0,
      };
    }
    const question = quiz.getQuestionById(answer.getQuestionId());
    if (!question) {
      throw new Error(
        `Question with ID ${answer.getQuestionId().getValue()} not found in Quiz ${quiz.id.getValue()}`
      );
    }
    const answerContent = getAnswerTextOrMedia(answer, quiz);
    let answerText: string[] = [];
    let answerMediaId: string[] = [];
    if (answerContent.hasValue()) {
      const dataContent = answerContent.getValue();
      if (dataContent.isText) {
        answerText = dataContent.resultsText;
      } else {
        answerMediaId = dataContent.resultsMedia;
      }
    }
    return {
      questionIndex: index + 1,
      questionText: question.text.value,
      isCorrect: answer.getIsCorrect(),
      answerText: answerText,
      answerMediaId: answerMediaId,
      timeTakenMs: answer.getTimeElapsed(),
    };
  });
  return {
    kahootId: plainQuiz.id,
    title: plainQuiz.title,
    userId: playerId.value,
    finalScore: game.getLeaderboardEntryFor(playerIdObj).getScore().getScore(),
    correctAnswers: questionResults.filter((q) => q.isCorrect).length,
    totalQuestions: plainQuiz.questions.length,
    averageTimeMs: calculateAverageTime(playerAnswers),
    rankingPosition: game
      .getLeaderboardEntryFor(PlayerId.of(playerId.value))
      .getRank(),
    questionResults: questionResults,
  };
}
