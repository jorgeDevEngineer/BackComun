import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BackofficeController } from "./backoffice.controller";
import { SearchUsersUseCase } from "../../application/SearchUsersUseCase";
import { TypeOrmUserRepository } from "../TypeOrm/TypeOrmUserRepository";
import { TypeOrmUserEntity } from "../TypeOrm/TypeOrmUserEntity";
import { TypeOrmMassiveNotificationRepository } from "../TypeOrm/TypeOrmMassiveNotificationRepository";
import { TypeOrmMassiveNotificationEntity } from "../TypeOrm/TypeOrmMassiveNotificationEntity";
import { BlockUserUseCase } from "../../application/BlockUserUseCase";
import { DeleteUserUseCase } from "../../application/DeleteUserUseCase";
import { SendNotificationUseCase } from "../../application/SendNotificationUseCase";
import { UnblockUserUseCase } from "../../application/UnblockUserUseCase";
import { GiveAdminRoleUseCase } from "../../application/GiveAdminUseCase";
import { RemoveAdminRoleUseCase } from "../../application/RemoveAdminUseCase";
import { GetNotificationsUseCase } from "../../application/GetNotificationUseCase";
import { SMTPSendMailService } from "../SMTP/SMTPSendMailService";
import { AssetUrlResolver } from "src/lib/shared/infrastructure/providers/AssetUrlResolver";
import { AuthModule } from "src/lib/auth/infrastructure/NestJs/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmUserEntity, TypeOrmMassiveNotificationEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [BackofficeController],
  providers: [
    SearchUsersUseCase,
    BlockUserUseCase,
    UnblockUserUseCase,
    DeleteUserUseCase,
    SendNotificationUseCase,
    GiveAdminRoleUseCase,
    RemoveAdminRoleUseCase,
    GetNotificationsUseCase,
    {
      provide: "UserRepository",
      useClass: TypeOrmUserRepository,
    },
    {
      provide: "MassiveNotificationRepository",
      useClass: TypeOrmMassiveNotificationRepository,
    },
    {
      provide: "IAssetUrlResolver",
      useClass: AssetUrlResolver,
    },
    {
      provide: "SendMailService",
      useClass: SMTPSendMailService,
    },
  ],
  exports: [
    SearchUsersUseCase,
    BlockUserUseCase,
    DeleteUserUseCase,
    SendNotificationUseCase,
    UnblockUserUseCase,
    GiveAdminRoleUseCase,
    RemoveAdminRoleUseCase,
    GetNotificationsUseCase,
  ],
})
export class BackofficeModule {}
