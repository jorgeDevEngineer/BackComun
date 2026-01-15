import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { JwtTokenProvider } from "../providers/JwtTokenProvider";
import { LoginCommandHandler } from "../../application/Handlers/Commands/LoginCommandHandler";
import { RegisterCommandHandler } from "../../application/Handlers/Commands/RegisterCommandHandler"; // Ensure this is used or remove
import { LogoutCommandHandler } from "../../application/Handlers/Commands/LogoutCommandHandler";
import { CheckTokenStatusQueryHandler } from "../../application/Handlers/Querys/CheckTokenStatusQueryHandler";
import { UserModule } from "../../../user/infrastructure/NestJS/user.module";

@Module({
  imports: [
    // We import UserModule to get access to its exported handlers
    forwardRef(() => UserModule),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>("JWT_SECRET") ?? "";
        const expiresIn = config.get<string>("JWT_EXPIRES_IN");
        return {
          secret,
          signOptions: { expiresIn: expiresIn as any },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: "ITokenProvider",
      useClass: JwtTokenProvider,
    },
    LoginCommandHandler,
    LogoutCommandHandler,
    CheckTokenStatusQueryHandler,
    // REMOVED: GetOneUserByEmailQueryHandler
    // REMOVED: GetOneUserByIdQueryHandler
  ],
  exports: ["ITokenProvider"],
})
export class AuthModule {}
