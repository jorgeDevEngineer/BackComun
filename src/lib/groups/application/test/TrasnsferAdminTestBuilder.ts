import { Group } from "../../domain/entity/Group";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GroupTestAPI {
  private aggregate!: Group;
  private capturedError: any;

  public given(aggregate: Group): this {
    this.aggregate = aggregate;
    return this;
  }

  public whenAdminIsTransferred(requestedBy: string, newAdmin: string): this {
    try {
      this.aggregate.transferAdmin(
        new UserId(requestedBy),
        new UserId(newAdmin)
      );
    } catch (error) {
      this.capturedError = error;
    }
    return this;
  }

  public thenItShouldFailWith(expectedMessage: string): void {
    expect(this.capturedError).toBeDefined();
    expect(this.capturedError.message).toBe(expectedMessage);
  }
}