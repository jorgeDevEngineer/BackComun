import { AuthTokenPayload } from "../parameterObjects/TokenPayload";

export interface ITokenProvider {
  generateToken(payload: Record<string, any>): Promise<string>;
  validateToken(token: string): Promise<Record<string, any> | null>;
  revokeToken(token: string): Promise<void>;
  /**
   * Extracts the Bearer token from the Authorization header, validates it,
   * and returns the decoded payload. Throws if header/token is invalid.
   */
  getPayloadFromAuthHeader(
    authHeader: string
  ): Promise<AuthTokenPayload | null>;
  /**
   * Convenience: returns `payload.id` from a valid Authorization header.
   * Throws if header/token/payload.id is invalid.
   */
  getUserIdFromAuthHeader(authHeader: string): Promise<string>;
}
