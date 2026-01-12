import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./DomainException";

export class NotificationBusinessException extends DomainException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}