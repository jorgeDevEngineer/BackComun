import { UserId } from "../../../src/lib/user/domain/valueObject/UserId";
import { EnableMembershipTestBuilder } from "./EnableMembershipTestBuilder";
import { EnableMembershipMother } from "../domain/EnableMembershipMother";

describe("Enable Membership Handlers", () => {
  let api: EnableMembershipTestBuilder;
  beforeEach(() => {
    api = new EnableMembershipTestBuilder();
  });

  it("premium: fails when targetUserId is missing", async () => {
    const cmd = EnableMembershipMother.premiumMissingId();
    await api.whenPremiumEnabled(cmd);
    api.thenShouldFailMissingId();
  });

  it("premium: fails when user not found", async () => {
    api.givenUserDoesNotExist();
    const cmd = EnableMembershipMother.premiumWithId(UserId.generateId().value);
    await api.whenPremiumEnabled(cmd);
    api.thenShouldFailNotFound();
  });

  it("premium: succeeds enabling premium for existing user", async () => {
    const user = api.givenExistingUser();
    const cmd = EnableMembershipMother.premiumWithId(user.id.value);
    await api.whenPremiumEnabled(cmd);
    api.thenPremiumShouldSucceed(user);
  });

  it("free: fails when targetUserId is missing", async () => {
    const cmd = EnableMembershipMother.freeMissingId();
    await api.whenFreeEnabled(cmd);
    api.thenShouldFailMissingId();
  });

  it("free: fails when user not found", async () => {
    api.givenUserDoesNotExist();
    const cmd = EnableMembershipMother.freeWithId(UserId.generateId().value);
    await api.whenFreeEnabled(cmd);
    api.thenShouldFailNotFound();
  });

  it("free: succeeds enabling free for existing user", async () => {
    const user = api.givenExistingUser();
    const cmd = EnableMembershipMother.freeWithId(user.id.value);
    await api.whenFreeEnabled(cmd);
    api.thenFreeShouldSucceed(user);
  });
});
