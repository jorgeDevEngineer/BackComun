export class StartSinglePlayerGameCommand {
  constructor(
    public readonly kahootId: string,
    public readonly playerId: string
  ) {}
}

export class SubmitAnswerCommand {
  constructor(
    public readonly attemptId: string,
    public readonly slideId: string,
    public readonly answerIndex?: number | number[],
    public readonly timeElapsedSeconds?: number
  ) {}
}