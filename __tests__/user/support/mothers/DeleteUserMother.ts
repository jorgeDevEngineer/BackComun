import { DeleteUser } from "../../../../src/lib/user/application/Parameter Objects/DeleteUser";

export class DeleteUserMother {
  static withId(id: string): DeleteUser {
    return new DeleteUser(id);
  }
  static missingId(): DeleteUser {
    return new DeleteUser(undefined as unknown as string);
  }
}
