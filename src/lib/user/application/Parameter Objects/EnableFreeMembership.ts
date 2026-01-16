import { AuthTokenPayload } from "src/lib/auth/application/parameterObjects/TokenPayload";
export class EnableFreeMembership {
  constructor(
    public readonly targetUserId: string,
    public readonly requester?: AuthTokenPayload
  ) {}
}
