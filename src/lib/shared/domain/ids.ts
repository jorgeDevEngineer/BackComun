import { randomUUID } from "crypto";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
    return UUID_V4_REGEX.test(value);
}

/**
 * Encapsula un identificador para una sesión multijugador de un Kahoot (UUID v4).
 */
export class MultiplayerSessionId {

    private constructor(private readonly sessionId:string){
        if(!isValidUUID(sessionId)){
            throw new Error(`MultiplayerGameId does not have a valid UUID v4 format: ${sessionId}`);
        }
    }

    public static of(sessionId: string): MultiplayerSessionId{
        return new MultiplayerSessionId(sessionId);
    }

    public static generate(): MultiplayerSessionId{
        return new MultiplayerSessionId(randomUUID());
    }

    public getId():string{
        return this.sessionId;
    }
}
