import { ConsoleLogger, Injectable } from "@nestjs/common";
import { ILoggerPort } from "../../application/ports/logger.port";

@Injectable()
export class NestLoggerAdapter extends ConsoleLogger implements ILoggerPort {
  log(message: string) {
    super.log(message);
  }

  error(message: string, trace: string) {
    super.error(message, trace);
  }

  warn(message: string) {
    super.warn(message);
  }
}
