import { DeleteUserTestBuilder } from "../../support/builders/DeleteUserTestBuilder";
import { DeleteUserMother } from "../../support/mothers/DeleteUserMother";

describe("DeleteUserCommandHandler", () => {
  let api: DeleteUserTestBuilder;
  beforeEach(() => {
    api = new DeleteUserTestBuilder();
  });

  it("fails when targetUserId is missing", async () => {
    const cmd = DeleteUserMother.missingId();
    await api.whenUserIsDeleted(cmd);
    api.thenShouldFailMissingId();
  });

  it("deletes when targetUserId is provided", async () => {
    const cmd = DeleteUserMother.withId("123e4567-e89b-42d3-a456-426614174000");
    await api.whenUserIsDeleted(cmd);
    api.thenShouldSucceed();
  });
});
