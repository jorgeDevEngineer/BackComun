import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserPassword {
  readonly value: string;
  constructor(value: string) {
    if (this.isValid(value)) {
      this.value = value;
    } else {
      throw new DomainException("Invalid user password");
    }
  }

  isValid(value: string): boolean {
    const minLength = 6;
    return value.length >= minLength;
  }
}
