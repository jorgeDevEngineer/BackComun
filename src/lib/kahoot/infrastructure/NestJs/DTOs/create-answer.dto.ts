
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateAnswerDto {
    @IsString()
    @IsOptional()
    public readonly text: string;

    @IsBoolean()
    public readonly isCorrect: boolean;

    @IsString()
    @IsOptional()
    public readonly mediaId: string | null;
}
