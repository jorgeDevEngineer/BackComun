import { UserName } from "../valueObject/userName";
import { UserEmail } from "../valueObject/UserEmail";
import { UserHashedPassword } from "../valueObject/UserHashedPassword";
import { UserType } from "../valueObject/UserType";
import { UserAvatarUrl } from "../valueObject/UserAvatarUrl";
import { UserTheme } from "../valueObject/UserTheme";
import { UserLanguage } from "../valueObject/UserLanguaje";
import { UserGameStreak } from "../valueObject/UserGameStreak";
import { UserDate } from "../valueObject/UserDate";
import { UserId } from "../valueObject/UserId";

export class User {
  id: UserId;
  name: UserName;
  email: UserEmail;
  hasshedPassword: UserHashedPassword; // Opcional al devolver la respuesta al front
  userType: UserType;
  avatarUrl: UserAvatarUrl;
  theme?: UserTheme; // Default: 'light'
  language?: UserLanguage; // Default: 'es'
  gameStreak: UserGameStreak; // Default: 0
  createdAt: UserDate;
  updatedAt: UserDate;

  constructor(
    id: string,
    name: string,
    email: string,
    hasshedPassword: string,
    userType: "student" | "teacher" | "personal",
    avatarUrl: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = new UserId(id);
    this.name = new UserName(name);
    this.email = new UserEmail(email);
    this.hasshedPassword = new UserHashedPassword(hasshedPassword);
    this.userType = new UserType(userType);
    this.avatarUrl = new UserAvatarUrl(avatarUrl);
    this.createdAt = new UserDate(createdAt);
    this.updatedAt = new UserDate(updatedAt);
    if (!this.gameStreak) this.gameStreak = new UserGameStreak(0);
    if (!this.theme) this.theme = new UserTheme("light");
    if (!this.language) this.language = new UserLanguage("es");
  }
}
