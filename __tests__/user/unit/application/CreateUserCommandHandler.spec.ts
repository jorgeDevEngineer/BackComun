import { CreateUserTestBuilder } from "../../support/builders/CreateUserTestBuilder";

describe("CreateUserCommandHandler (Refactorizado)", () => {
  it("creates a user successfully when data is valid and no conflicts exist", async () => {
    // 1. Setup
    const testAPI = new CreateUserTestBuilder();

    // 2. Given / When / Then fluido
    testAPI.givenUserDoesNotExist();
    await testAPI.whenUserIsCreated(
      "john_doe",
      "john@example.com",
      "StrongPass1!"
    );
    testAPI.thenUserShouldBeCreatedSuccessfully();
  });

  it("fails when username is already taken", async () => {
    const testAPI = new CreateUserTestBuilder();
    const existingUsername = "john_doe";

    testAPI.givenUsernameAlreadyExists(existingUsername);

    await testAPI.whenUserIsCreated(
      existingUsername,
      "other@example.com",
      "StrongPass1!"
    );

    testAPI.thenShouldFailWithBusinessError("username already exists");
  });

  it("fails when email is already taken", async () => {
    const testAPI = new CreateUserTestBuilder();
    const existingEmail = "john@example.com";

    testAPI.givenEmailAlreadyExists(existingEmail);

    await testAPI.whenUserIsCreated("new_user", existingEmail, "StrongPass1!");

    testAPI.thenShouldFailWithBusinessError("email already exists");
  });
});
