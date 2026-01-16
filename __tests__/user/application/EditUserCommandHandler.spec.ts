import { EditUser } from "../../../src/lib/user/application/Parameter Objects/EditUser";
import { DomainException } from "../../../src/lib/shared/exceptions/domain.exception";
import { UserId } from "../../../src/lib/user/domain/valueObject/UserId";
import { EditUserTestBuilder } from "./EditUserTestBuilder";
import { EditUserMother } from "../domain/EditUserMother";

// Refactored to use EditUserTestBuilder and mothers; remove legacy helpers.

describe("EditUserCommandHandler", () => {
  let api: EditUserTestBuilder;
  beforeEach(() => {
    api = new EditUserTestBuilder();
  });

  it("fails when targetUserId is missing", async () => {
    const cmd = EditUserMother.minimal(undefined as unknown as string);
    await api.whenUserIsEdited(cmd);
    api.thenShouldFailWithDomainError();
  });

  it("fails when user does not exist", async () => {
    api.givenUserDoesNotExist();
    const cmd = EditUserMother.minimal(UserId.generateId().value);
    await api.whenUserIsEdited(cmd);
    api.thenShouldFailNotFound();
  });

  it("fails with DomainException when changing to a taken username", async () => {
    const existing = await api.givenExistingUser();
    api.givenUsernameTaken();
    const cmd = EditUserMother.withUsername(existing.id.value, "taken_name");
    await api.whenUserIsEdited(cmd);
    api.thenShouldFailWithDomainError(/belongs to another user/i);
  });

  it("fails when new password provided but current password missing", async () => {
    const existing = await api.givenExistingUser();
    const cmd = EditUserMother.withPasswordChange(
      existing.id.value,
      undefined,
      "NewPass1!",
      "NewPass1!"
    );
    await api.whenUserIsEdited(cmd);
    api.thenShouldFailWithError(/current password is required/i);
  });

  it("succeeds when editing simple fields without conflicts", async () => {
    const existing = await api.givenExistingUser();
    const cmd = EditUserMother.withEmail(
      existing.id.value,
      "newmail@example.com"
    );
    await api.whenUserIsEdited(cmd);
    api.thenShouldSucceed();
  });
});
