import { MassiveNotification } from "../entity/MassiveNotification";

export interface MassiveNotificationRepository {
    sendMassiveNotification(data:{
        title: string;
        message: string;
        userId: string;
    }): Promise<
    {
        id: string;
        title: string;
        message: string;
        createdAt: Date;
        sender: {
            ImageUrl: string;
            id: string;
            name: string;
            email: string;
        }
    }
    >;


    getMassiveNotifications(
        params: {
            userId?: string;
            limit?: number;
            page?: number;
            orderBy?: string;
            order: 'asc' | 'desc';
        }
    ): Promise<
    {
        data: {
            id: string;
            title: string;
            message: string;
            createdAt: Date;
            sender: {
                ImageUrl: string;
                id: string;
                name: string;
                email: string;
            }
        }[];
        pagination: {
            page: number;
            limit: number;
            totalCount: number;
            totalPages: number;
        };
    }>;

}