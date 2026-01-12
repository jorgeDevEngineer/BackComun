import { Inject, Injectable } from "@nestjs/common";
import { IHandler } from "src/lib/shared/IHandler"; // Tu interfaz genérica
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { NotificationBusinessException } from "../../../../shared/exceptions/NotificationBussinesException";
import { UnregisterDeviceCommand } from "../../parameterObjects/UnregisterDeviceCommand";
import { IDeviceRepository } from "../../../domain/port/IDeviceRepository";
import { DeviceToken } from "../../../domain/valueObject/DeviceToken";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { UnregisterDeviceResponseDto } from "../../dtos/NotificationsResponse.dto";

@Injectable()
export class UnregisterDeviceCommandHandler
  implements IHandler<UnregisterDeviceCommand, Either<DomainException, UnregisterDeviceResponseDto>>
{
  constructor(
    @Inject('IDeviceRepository') 
    private readonly deviceRepository: IDeviceRepository
  ) {}

  async execute(command: UnregisterDeviceCommand): Promise<Either<DomainException, UnregisterDeviceResponseDto>> {
    
    try {
      const userId = new UserId(command.userId);
      const token = DeviceToken.create(command.token); 
      await this.deviceRepository.removeToken(userId.getValue(), token);

      return Either.makeRight({
        message: "Dispositivo desvinculado exitosamente"
      });

    } catch (e) {
      const exception = e instanceof DomainException 
        ? e 
        : new NotificationBusinessException(e.message);
        
      return Either.makeLeft(exception);
    }
  }
}