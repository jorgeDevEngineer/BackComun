import { Inject, Injectable } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { NotificationBusinessException } from "../../../../shared/exceptions/NotificationBussinesException";
import { RegisterDeviceCommand } from "../../parameterObjects/RegisterDeviceCommand";
import { IDeviceRepository } from "../../../domain/port/IDeviceRepository";
import { DeviceToken } from "../../../domain/valueObject/DeviceToken";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export interface RegisterDeviceResponseDto {
  message: string;
}

@Injectable() 
export class RegisterDeviceCommandHandler
  implements IHandler<RegisterDeviceCommand, Either<DomainException, RegisterDeviceResponseDto>>
{
  constructor(
    @Inject('IDeviceRepository') 
    private readonly deviceRepository: IDeviceRepository
  ) {}

  async execute(command: RegisterDeviceCommand): Promise<Either<DomainException, RegisterDeviceResponseDto>> {
    
    try {
      const userId = new UserId(command.userId);
      const token = DeviceToken.create(command.token);

      await this.deviceRepository.saveToken(
        userId,
        token,
        command.deviceType
      );

      return Either.makeRight({
        message: "Dispositivo registrado exitosamente"
      });

    } catch (e) {
      const exception = e instanceof DomainException 
        ? e 
        : new NotificationBusinessException(e.message);
        
      return Either.makeLeft(exception);
    }
  }
}