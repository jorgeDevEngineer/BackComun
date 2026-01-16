import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class InvalidTokenException extends DomainException {
  constructor() {
    super("Invalid token");
  }
}

