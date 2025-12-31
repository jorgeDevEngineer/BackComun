import { randomUUID } from "crypto";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
    return UUID_V4_REGEX.test(value);
}

/**
 * Encapsula un identificador para un jugador de una sesión multijugador (solo le interesa a la sesión así que no está en shared)
 */
export class PlayerId {

    private constructor(private readonly playerId:string){
        if(!isValidUUID(playerId)){
            throw new Error(`PlayerId does not have a valid UUID v4 format: ${playerId}`);
        }
    }

    public static of(playerId: string): PlayerId{
        return new PlayerId(playerId);
    }

    public static generate(): PlayerId{
        return new PlayerId(randomUUID());
    }

    public getId():string{
        return this.playerId;
    }
}