
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
  BadRequestException,
  UsePipes,
  ValidationPipe,
  Headers,
} from "@nestjs/common";
import {
  CreateQuizUseCase,
  CreateQuiz,
} from "../../application/CreateQuizUseCase";
import { GetQuiz, GetQuizUseCase } from "../../application/GetQuizUseCase";
import { ListUserQuizzes, ListUserQuizzesUseCase } from "../../application/ListUserQuizzesUseCase";
import {
  UpdateQuizUseCase,
  UpdateQuiz,
} from "../../application/UpdateQuizUseCase";
import { DeleteQuizUseCase, DeleteQuiz } from "../../application/DeleteQuizUseCase";
import { IsString, Length } from "class-validator";
import { Result } from "../../../shared/Type Helpers/result";
import { GetAllKahoots, GetAllKahootsUseCase } from "../../application/GetAllKahootsUseCase";
import { CreateQuizDto } from "./DTOs/create-quiz.dto";
import { UpdateQuizDto } from "./DTOs/update-quiz.dto";

export class FindOneParams {
  @IsString()
  @Length(36, 36)
  id: string;
}

@Controller("kahoots")
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
    @Inject(GetAllKahootsUseCase)
    private readonly getAllKahootsUseCase: GetAllKahootsUseCase
  ) {}

  private handleResult<T>(result: Result<T>) {
    if (result.isFailure) {
      if (result.error.message.toLowerCase().includes("not found")) {
        throw new NotFoundException(result.error.message);
      }
      throw new BadRequestException(result.error.message);
    }
    return result.getValue();
  }

  @Get("all")
  async getAllKahoots(@Headers('Authorization') auth: string) {
    const getAllKahootsData: GetAllKahoots = {
        auth: auth,
    };
    const result = await this.getAllKahootsUseCase.execute(getAllKahootsData);
    const quizzes = this.handleResult(result);
    return quizzes.map((q) => q.toPlainObject());
  }

  @Get("user")
  async listUserQuizzes(@Headers('Authorization') auth: string) {
    const listUserQuizzesData: ListUserQuizzes = {
        auth: auth,
    };
    const result = await this.listUserQuizzesUseCase.execute(listUserQuizzesData);
    const quizzes = this.handleResult(result);
    return quizzes.map((q) => q.toPlainObject());
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createQuizDto: CreateQuizDto, @Headers('Authorization') auth: string) {

    const createQuizData: CreateQuiz = {
      ...createQuizDto,
      auth: auth,
      questions: createQuizDto.questions,
    };

    const result = await this.createQuizUseCase.execute(createQuizData);
    const quiz = this.handleResult(result);
    return quiz.toPlainObject();
  }

  @Put(":id")
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async edit(
    @Param() params: FindOneParams,
    @Body() updateQuizDto: UpdateQuizDto,
    @Headers('Authorization') auth: string
  ) {
    const updateQuizData: UpdateQuiz = {
      quizId: params.id,
      auth: auth,
      ...updateQuizDto,
    };
    const result = await this.updateQuizUseCase.execute(updateQuizData);
    const quiz = this.handleResult(result);
    return quiz.toPlainObject();
  }

  @Delete(":id")
  async delete(@Param() params: FindOneParams, @Headers('Authorization') auth: string) {
    const deleteQuizData: DeleteQuiz = {
        quizId: params.id,
        auth: auth,
    };
    const result = await this.deleteQuizUseCase.execute(deleteQuizData);

    return this.handleResult(result);
  }

  @Get(":id")
  async getOneById(@Param() params: FindOneParams, @Headers('Authorization') auth: string) {
    const getQuizData: GetQuiz = {
      quizId: params.id,
      auth: auth
    }
    const result = await this.getQuizUseCase.execute(getQuizData);
    const quiz = this.handleResult(result);
    return quiz.toPlainObject();
  }
}
