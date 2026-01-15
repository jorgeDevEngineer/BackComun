import { IsNotEmpty, IsString, MinLength, IsIn, IsBoolean } from 'class-validator';

export class NotificationDto {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  resourceId?: string;
}

export class RegisterDeviceResponseDto {
  @IsString()
  @IsNotEmpty({ message: 'El token FCM es obligatorio' })
  @MinLength(10, { message: 'El token es demasiado corto para ser un FCM válido' })
  token: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['android', 'ios', 'web'], { message: 'El tipo de dispositivo debe ser android, ios o web' })
  deviceType: string;
}

export class UnregisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class UnregisterDeviceResponseDto{
  message: string;
}


export class UpdateNotificationDto {
    @IsBoolean({ message: 'isRead debe ser un booleano.' })
    @IsNotEmpty({ message: 'isRead es obligatorio.' })
    public readonly isRead: boolean;
}