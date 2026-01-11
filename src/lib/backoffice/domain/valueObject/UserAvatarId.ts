import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserAvatarId {
  readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid avatar asset id");
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    if (value === undefined || value === null) return false;
    if (value === "") return true;
    return typeof value === "string" && value.trim().length > 0;
  }
}
