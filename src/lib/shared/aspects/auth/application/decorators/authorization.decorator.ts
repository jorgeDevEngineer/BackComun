import { IHandler } from "src/lib/shared/IHandler";
import { AuthTokenPayload } from "src/lib/auth/application/parameterObjects/TokenPayload";
import { UnauthorizedException } from "@nestjs/common";

export class AuthorizationDecorator<
  TRequest extends { targetUserId: string; requester?: AuthTokenPayload },
  TResponse,
> implements IHandler<TRequest, TResponse>
{
  constructor(private readonly useCase: IHandler<TRequest, TResponse>) {}

  async execute(request: TRequest): Promise<TResponse> {
    const requester = request.requester;
    if (!requester) {
      throw new UnauthorizedException("Missing auth payload");
    }
    const roles = Array.isArray(requester.roles) ? requester.roles : [];
    const isAdmin = roles.some((r) => String(r).toLowerCase() === "admin");
    const isSelf = requester.id === request.targetUserId;
    if (!isSelf && !isAdmin) {
      throw new UnauthorizedException(
        "You can only operate on your own account or be admin"
      );
    }
    return this.useCase.execute(request);
  }
}
