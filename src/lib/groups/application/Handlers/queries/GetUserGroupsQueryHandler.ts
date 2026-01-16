import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";

import { GetUserGroupsQuery } from "../../parameterObjects/GetUserGroupsQuery";
import { GetUserGroupsResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetUserGroupsQueryHandler implements IHandler<GetUserGroupsQuery, Either<DomainException, GetUserGroupsResponseDto[]>> {
    constructor(
        private readonly groupRepository: GroupRepository
    ) {}
    
    async execute(query: GetUserGroupsQuery): Promise<Either<DomainException, GetUserGroupsResponseDto[]>> {
        const userId = new UserId(query.currentUserId);

        const groups = await this.groupRepository.findByMember(userId);

        const groupsData: GetUserGroupsResponseDto[] = groups.map((g) => {
        const userRole = g.adminId.value === userId.value ? "ADMIN" : "MEMBER";
        
        const descriptionValue = g.description.hasValue() 
            ? g.description.getValue().value 
            : "";

        return {
            id: g.id.value,
            name: g.name.value,
            adminId: g.adminId.value, 
            description: descriptionValue,
            role: userRole,
            memberCount: g.members.length,
            createdAt: g.createdAt.toISOString(),
        };
    });
    return Either.makeRight(groupsData);
}
}
//