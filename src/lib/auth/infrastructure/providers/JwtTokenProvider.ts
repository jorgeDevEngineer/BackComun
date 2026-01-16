import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ITokenProvider } from "../../application/providers/ITokenProvider";
import { AuthTokenPayload } from "../../application/parameterObjects/TokenPayload";

@Injectable()
export class JwtTokenProvider implements ITokenProvider {
  private revoked = new Set<string>();

  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: Record<string, any>): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<AuthTokenPayload | null> {
    if (this.revoked.has(token)) return null;
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }

  async revokeToken(token: string): Promise<void> {
    this.revoked.add(token);
  }

  async getPayloadFromAuthHeader(
    authHeader: string
  ): Promise<AuthTokenPayload> {
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token) {
      throw new UnauthorizedException("Token required");
    }
    const payload = await this.validateToken(token);
    if (!payload) {
      throw new UnauthorizedException("Invalid token");
    }
    return payload as AuthTokenPayload;
  }

  async getUserIdFromAuthHeader(authHeader: string): Promise<string> {
    const payload = await this.getPayloadFromAuthHeader(authHeader);
    if (!payload.id) {
      throw new UnauthorizedException("Invalid token");
    }
    return payload.id;
  }
}
