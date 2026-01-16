import { EnablePremiumMembership } from "../../../../src/lib/user/application/Parameter Objects/EnablePremiumMembership";
import { EnableFreeMembership } from "../../../../src/lib/user/application/Parameter Objects/EnableFreeMembership";

export class EnableMembershipMother {
  static premiumWithId(id: string): EnablePremiumMembership {
    return new EnablePremiumMembership(id);
  }
  static premiumMissingId(): EnablePremiumMembership {
    return new EnablePremiumMembership(undefined as unknown as string);
  }
  static freeWithId(id: string): EnableFreeMembership {
    return new EnableFreeMembership(id);
  }
  static freeMissingId(): EnableFreeMembership {
    return new EnableFreeMembership(undefined as unknown as string);
  }
}
