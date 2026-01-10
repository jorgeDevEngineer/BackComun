import { IsNotEmpty, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['android', 'ios', 'web'], { message: 'Invalid device type' })
  deviceType: string;
}