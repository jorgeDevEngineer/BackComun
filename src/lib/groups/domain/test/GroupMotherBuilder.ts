import { GroupBuilder } from "./GroupBuilder";

export class GroupMother {
  public static aGroup(): GroupBuilder {
    return new GroupBuilder();
  }

  public static aGroupWithAdminAndMember(adminId: string, memberId: string) {
    return new GroupBuilder()
      .withAdmin(adminId)
      .withMember(memberId);
  }
}