
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { CreateQuizUseCase, CreateQuiz } from '../../application/CreateQuizUseCase'; 
import { GetQuizUseCase } from '../../application/GetQuizUseCase';
import { ListUserQuizzesUseCase } from '../../application/ListUserQuizzesUseCase';
import { UpdateQuizUseCase, UpdateQuizDto } from '../../application/UpdateQuizUseCase';
import { DeleteQuizUseCase } from '../../application/DeleteQuizUseCase';
import { IsString, Length } from 'class-validator';

export class FindOneParams {
  @IsString()
  @Length(5, 255)
  id: string;
}

@Controller('kahoots')
export class KahootController {
  constructor(
    @Inject(CreateQuizUseCase)
    private readonly createQuizUseCase: CreateQuizUseCase,
    @Inject(GetQuizUseCase)
    private readonly getQuizUseCase: GetQuizUseCase,
    @Inject(ListUserQuizzesUseCase)
    private readonly listUserQuizzesUseCase: ListUserQuizzesUseCase,
    @Inject(UpdateQuizUseCase)
    private readonly updateQuizUseCase: UpdateQuizUseCase,
    @Inject(DeleteQuizUseCase)
    private readonly deleteQuizUseCase: DeleteQuizUseCase,
  ) {}

  @Get('user/:userId')
  async listUserQuizzes(@Param('userId') userId: string) {
    const result = await this.listUserQuizzesUseCase.execute(userId);
    if (result.isFailure) {
      // Ahora el caso de uso devuelve un Result, así que podemos manejar el error.
      throw new HttpException(result.error, HttpStatus.BAD_REQUEST);
    }
    const quizzes = result.getValue();
    return quizzes.map((q) => q.toPlainObject());
  }

  @Get(':id')
  async getOneById(@Param() params: FindOneParams) {
    const result = await this.getQuizUseCase.execute(params.id);

    if (result.isFailure) {
      throw new NotFoundException(result.error); // CORRECTED: getError() -> error
    }

    const quiz = result.getValue();
    return quiz.toPlainObject();
  }

  @Post()
  async create(@Body() body: CreateQuiz) { 
    const result = await this.createQuizUseCase.execute(body);
    if (result.isFailure) {
        throw new HttpException(result.error, HttpStatus.BAD_REQUEST); // CORRECTED: getError() -> error
    }
    const quiz = result.getValue();
    return quiz.toPlainObject();
  }

  @Put(':id')
  async edit(@Param() params: FindOneParams, @Body() body: CreateQuiz) { 
    const updateQuizDto: UpdateQuizDto = {
      ...body,
      quizId: params.id
    };
    const result = await this.updateQuizUseCase.execute(updateQuizDto);
    if (result.isFailure) {
        throw new HttpException(result.error, HttpStatus.BAD_REQUEST); // CORRECTED: getError() -> error
    }
    const quiz = result.getValue();
    return quiz.toPlainObject();
  }

  @Delete(':id')
  async delete(@Param() params: FindOneParams) {
    const result = await this.deleteQuizUseCase.execute(params.id);
    if (result.isFailure) {
        throw new HttpException(result.error, HttpStatus.BAD_REQUEST); // CORRECTED: getError() -> error
    }
    return; 
  }
}
