export interface UuidGenerator {
  generate(): string;
  isValid(uuid: string): boolean;
}