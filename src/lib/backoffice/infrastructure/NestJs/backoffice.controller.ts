import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  Patch,
  Query,
  Headers,
  Delete,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { SearchUsersUseCase } from "../../application/SearchUsersUseCase";
import { BlockUserUseCase } from "../../application/BlockUserUseCase";
import { UnblockUserUseCase } from "../../application/UnblockUserUseCase";
import { DeleteUserUseCase } from "../../application/DeleteUserUseCase";
import { GiveAdminRoleUseCase } from "../../application/GiveAdminUseCase";
import { RemoveAdminRoleUseCase } from "../../application/RemoveAdminUseCase";
import { SendNotificationUseCase } from "../../application/SendNotificationUseCase";
import { GetNotificationsUseCase } from "../../application/GetNotificationUseCase";
import { InvalidTokenException } from "../../domain/exceptions/InvalidTokenException";
import { UnauthorizedAdminException } from "../../domain/exceptions/UnauthorizedAdminException";

@Controller("backoffice")
export class BackofficeController {
  constructor(
    @Inject(SearchUsersUseCase)
    private readonly searchUsersUseCase: SearchUsersUseCase,
    @Inject(BlockUserUseCase)
    private readonly blockUserUseCase: BlockUserUseCase,
    @Inject(DeleteUserUseCase)
    private readonly deleteUserUseCase: DeleteUserUseCase,
    @Inject(SendNotificationUseCase)
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    @Inject(UnblockUserUseCase)
    private readonly unblockUserUseCase: UnblockUserUseCase,
    @Inject(GiveAdminRoleUseCase)
    private readonly giveAdminRoleUseCase: GiveAdminRoleUseCase,
    @Inject(RemoveAdminRoleUseCase)
    private readonly removeAdminRoleUseCase: RemoveAdminRoleUseCase,
    @Inject(GetNotificationsUseCase)
    private readonly getNotificationsUseCase: GetNotificationsUseCase
  ) {}

  /**
   * Mapea errores de dominio a códigos HTTP apropiados
   */
  private mapErrorToHttpStatus(error: Error): HttpStatus {
    if (error instanceof InvalidTokenException) {
      return HttpStatus.BAD_REQUEST;
    }
    if (error instanceof UnauthorizedAdminException) {
      return HttpStatus.UNAUTHORIZED;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  @Get("users")
  async searchUser(
    @Headers("Authorization") auth: string,
    @Query("q") q?: string,
    @Query("limit", new DefaultValuePipe(10)) limit?: number,
    @Query("page", new DefaultValuePipe(1)) page?: number,
    @Query("orderBy", new DefaultValuePipe("createdAt")) orderBy?: string,
    @Query("order", new DefaultValuePipe("desc")) order: "asc" | "desc" = "desc"
  ) {
    const result = await this.searchUsersUseCase.execute({
      auth,
      params: { q, limit, page, orderBy, order },
    });

    if (result.isFailure) {
      throw new HttpException(
        result.error?.message || "Error searching users",
        this.mapErrorToHttpStatus(result.error!)
      );
    }

    return result.getValue();
  }

  @Patch("blockUser/:userId")
  async blockUser(
    @Headers("Authorization") auth: string,
    @Param("userId") userId: string
  ) {
    const result = await this.blockUserUseCase.execute({ auth, userId });

    if (result.isFailure) {
      throw new HttpException(
        result.error?.message || "Error blocking user",
        this.mapErrorToHttpStatus(result.error!)
      );
    }

    return result.getValue();
  }

  @Patch("unblockUser/:userId")
  async unblockUser(
    @Headers("Authorization") auth: string,
    @Param("userId") userId: string
  ) {
    const result = await this.unblockUserUseCase.execute({ auth, userId });

    if (result.isFailure) {
      throw new HttpException(
        result.error?.message || "Error unblocking user",
        this.mapErrorToHttpStatus(result.error!)
      );
    }

    return result.getValue();
  }

  @Delete("user/:userId")
  async deleteUser(
    @Headers("Authorization") auth: string,
    @Param("userId") userId: string
  ) {
    const result = await this.deleteUserUseCase.execute({ auth, userId });

    if (result.isFailure) {
      throw new HttpException(
        result.error?.message || "Error deleting user",
        this.mapErrorToHttpStatus(result.error!)
      );
    }

    return { success: true };
  }

  @Patch("giveAdmin/:userId")
  async giveAdminRole(
    @Headers("Authorization") auth: string,
    @Param("userId") userId: string
  ) {
    const result = await this.giveAdminRoleUseCase.execute({ auth, userId });

    if (result.isFailure) {
      throw new HttpException(
        result.error?.message || "Error giving admin role",
        this.mapErrorToHttpStatus(result.error!)
      );
    }

    return result.getValue();
  }

  @Patch("removeAdmin/:userId")
  async removeAdminRole(
    @Headers("Authorization") auth: string,
    @Param("userId") userId: string
  ) {
    const result = await this.removeAdminRoleUseCase.execute({ auth, userId });

    if (result.isFailure) {
      throw new HttpException(
        result.error?.message || "Error removing admin role",
        this.mapErrorToHttpStatus(result.error!)
      );
    }

    return result.getValue();
  }

  @Post("massNotifications")
  async sendNotification(
    @Headers("Authorization") auth: string,
    @Body()
    body: {
      title: string;
      message: string;
      filters: {
        toAdmins: boolean;
        toRegularUsers: boolean;
      };
    }
  ) {
    const result = await this.sendNotificationUseCase.execute({
      auth,
      body: {
        title: body.title,
        message: body.message,
        filters: body.filters,
      },
    });

    if (result.isFailure) {
      throw new HttpException(
        result.error?.message || "Error sending notification",
        this.mapErrorToHttpStatus(result.error!)
      );
    }

    return result.getValue();
  }

  @Get("massNotifications")
  async getNotifications(
    @Headers("Authorization") auth: string,
    @Query("userId") userId?: string,
    @Query("limit", new DefaultValuePipe(10)) limit?: number,
    @Query("page", new DefaultValuePipe(1)) page?: number,
    @Query("orderBy", new DefaultValuePipe("createdAt")) orderBy?: string,
    @Query("order", new DefaultValuePipe("desc")) order: "asc" | "desc" = "desc"
  ) {
    const result = await this.getNotificationsUseCase.execute({
      auth,
      params: { userId, limit, page, orderBy, order },
    });

    if (result.isFailure) {
      throw new HttpException(
        result.error?.message || "Error getting notifications",
        this.mapErrorToHttpStatus(result.error!)
      );
    }

    return result.getValue();
  }
}
