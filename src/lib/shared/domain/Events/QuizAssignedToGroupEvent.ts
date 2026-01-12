export class QuizAssignedToGroupEvent {
  constructor(
    public readonly groupId: string,
    public readonly quizId: string,
    
    public readonly groupName: string,
    public readonly quizTitle: string,   
    public readonly assignerName: string, 
    
    public readonly memberIds: string[], 
    public readonly assignedAt: Date,
  ) {}
}