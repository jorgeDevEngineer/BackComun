import { UuidGenerator } from "../../domain/ports/UuuidGenerator";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class CryptoUuidGenerator implements UuidGenerator {

  generate(): string {
    return randomUUID(); 
  }
  
  isValid(uuid: string): boolean {
    return UUID_V4_REGEX.test(uuid);
  }
}