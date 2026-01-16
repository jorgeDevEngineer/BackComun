import { User } from "src/lib/user/domain/aggregate/User";

export interface AuthTokenPayload {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export class TokenPayload {
  static fromUser(user: User): AuthTokenPayload {
    return {
      id: user.id.value,
      username: user.userName.value,
      email: user.email.value,
      roles: user.roles.value,
    };
  }
}
