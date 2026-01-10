import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class MembershipDate {
  readonly value: Date;

  constructor(value: Date) {
    if (this.isValid(value) === false) {
      throw new DomainException("Invalid membership date");
    } else {
      this.value = value;
    }
  }

  private isValid(value: Date): boolean {
    console.log("MembershipDate validation:", value);
    const now = new Date().getDate();
    console.log("Current date:", now);
    return value.getDate() <= now;
  }
}
