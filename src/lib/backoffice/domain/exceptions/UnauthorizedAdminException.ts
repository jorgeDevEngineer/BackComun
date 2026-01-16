import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UnauthorizedAdminException extends DomainException {
  constructor() {
    super("Unauthorized: Admin role required");
  }
}

