import { Get, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmUserEntity } from "../TypeOrm/TypeOrmUserEntity";
import { UserController } from "./user.controller";
import { TypeOrmUserRepository } from "../TypeOrm/TypeOrmUserRepository";
import { GetOneUserByIdQueryHandler } from "../../application/Handlers/Querys/GetOneUserByIdQueryHandler";
import { GetAllUsersQueryHandler } from "../../application/Handlers/Querys/GetAllUsersQueryHandler";
import { CreateUserCommandHandler } from "../../application/Handlers/Commands/CreateUserCommandHandler";
import { DeleteUserCommandHandler } from "../../application/Handlers/Commands/DeleteUserCommandHandler";
import { EditUserCommandHandler } from "../../application/Handlers/Commands/EditUserCommandHandler";
import { GetOneUserByUserNameQueryHandler } from "../../application/Handlers/Querys/GetOneUserByUserNameQueryHandler";
import { EnablePremiumMembershipCommandHandler } from "../../application/Handlers/Commands/EnablePremiumMembershipCommandHandler";
import { EnableFreeMembershipCommandHandler } from "../../application/Handlers/Commands/EnableFreeMembershipCommandHandler";

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserEntity])],
  controllers: [UserController],
  providers: [
    {
      provide: "UserRepository",
      useClass: TypeOrmUserRepository,
    },
    {
      provide: "GetAllUsersQueryHandler",
      useFactory: (repository: TypeOrmUserRepository) =>
        new GetAllUsersQueryHandler(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "GetOneUserByIdQueryHandler",
      useFactory: (repository: TypeOrmUserRepository) =>
        new GetOneUserByIdQueryHandler(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "GetOneUserByUserNameQueryHandler",
      useFactory: (repository: TypeOrmUserRepository) =>
        new GetOneUserByUserNameQueryHandler(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "CreateUserCommandHandler",
      useFactory: (repository: TypeOrmUserRepository) =>
        new CreateUserCommandHandler(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "DeleteUserCommandHandler",
      useFactory: (repository: TypeOrmUserRepository) =>
        new DeleteUserCommandHandler(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "EditUserCommandHandler",
      useFactory: (repository: TypeOrmUserRepository) =>
        new EditUserCommandHandler(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "EnablePremiumMembershipCommandHandler",
      useFactory: (repository: TypeOrmUserRepository) =>
        new EnablePremiumMembershipCommandHandler(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "EnableFreeMembershipCommandHandler",
      useFactory: (repository: TypeOrmUserRepository) =>
        new EnableFreeMembershipCommandHandler(repository),
      inject: ["UserRepository"],
    },
  ],
})
export class UserModule {}
