import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In} from "typeorm";

import { GroupRepository } from "../../domain/port/GroupRepository";
import { Group } from "../../domain/entity/Group";
import { GroupId } from "../../domain/valueObject/GroupId";
import { GroupName } from "../../domain/valueObject/GroupName";
import { GroupDescription } from "../../domain/valueObject/GroupDescription";
import { GroupMember } from "../../domain/entity/GroupMember";
import { GroupRole } from "../../domain/valueObject/GroupMemberRole";
import { GroupQuizAssignment } from "../../domain/entity/GroupQuizAssigment";
import { GroupQuizCompletion } from "../../domain/entity/GroupQuizCompletion";
import { GroupInvitationToken } from "../../domain/valueObject/GroupInvitationToken";

import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";

import { GroupOrmEntity } from "./GroupOrmEntity";
import { GroupMemberOrmEntity } from "./GroupOrnMember";

@Injectable()
export class TypeOrmGroupRepository implements GroupRepository {
  constructor(
    @InjectRepository(GroupOrmEntity)
    private readonly ormRepo: Repository<GroupOrmEntity>,

    @InjectRepository(GroupMemberOrmEntity)
    private readonly memberRepo: Repository<GroupMemberOrmEntity>,
  ) {}

  async save(group: Group): Promise<void> {
  
    let groupOrm = await this.ormRepo.findOne({
      where: { id: group.id.value },
      relations: ["members"],
    });

    if (!groupOrm) {
      groupOrm = new GroupOrmEntity();
      groupOrm.id = group.id.value;
      groupOrm.createdAt = group.createdAt;
      groupOrm.members = [];
    }


    groupOrm.name = group.name.value;
    groupOrm.description = group.description?.value ?? "";
    groupOrm.adminId = group.adminId.value;
    groupOrm.updatedAt = group.updatedAt;
    groupOrm.invitationToken = group.invitationToken?.token ?? null;
    groupOrm.invitationExpiresAt = group.invitationToken?.expiresAt ?? null;

    const existingMembers = groupOrm.members ?? [];
    const domainUserIds = new Set(group.members.map((m) => m.userId.value));

    const membersToDelete = existingMembers.filter(
      (m) => !domainUserIds.has(m.userId),
    );

    if (membersToDelete.length > 0) {
      await this.memberRepo.remove(membersToDelete);
    }

    groupOrm.members = this.syncMembers(groupOrm, group.members);

  
    await this.ormRepo.save(groupOrm);
  }

  private syncMembers(
    groupOrm: GroupOrmEntity,
    domainMembers: GroupMember[],
  ): GroupMemberOrmEntity[] {
    const existingByUserId = new Map<string, GroupMemberOrmEntity>();

    for (const m of groupOrm.members ?? []) {
      existingByUserId.set(m.userId, m);
    }

    const nextMembers: GroupMemberOrmEntity[] = [];

    for (const member of domainMembers) {
      const userId = member.userId.value;
      const existing = existingByUserId.get(userId);

      if (existing) {
        existing.role = member.role.value;
        existing.joinedAt = member.joinedAt;
        existing.completedQuizzes = member.completedQuizzes;
        nextMembers.push(existing);
      } else {
        const m = new GroupMemberOrmEntity();
        m.group = groupOrm;
        m.userId = userId;
        m.role = member.role.value;
        m.joinedAt = member.joinedAt;
        m.completedQuizzes = member.completedQuizzes;
        nextMembers.push(m);
      }
    }

    return nextMembers;
  }

  
  private mapInvitationFromOrm(
    orm: GroupOrmEntity,
  ): GroupInvitationToken | null {
    if (!orm.invitationToken || !orm.invitationExpiresAt) {
      return null;
    }
    return GroupInvitationToken.create(
      orm.invitationToken,
      orm.invitationExpiresAt,
    );
  }

  private mapMembersFromOrm(orm: GroupOrmEntity): GroupMember[] {
    if (!orm.members || orm.members.length === 0) {
      return [];
    }

    const groupId = GroupId.of(orm.id);

    return orm.members.map((m) => {
      const member = GroupMember.create(
        UserId.of(m.userId),
        GroupRole.fromString(m.role),
        m.joinedAt,
      );

      member._setGroup(groupId);

      for (let i = 0; i < m.completedQuizzes; i++) {
        member.incrementCompletedQuizzes();
      }

      return member;
    });
  }

  private emptyAssignments(): GroupQuizAssignment[] {
    return [];
  }

  private emptyCompletions(): GroupQuizCompletion[] {
    return [];
  }

  private mapToDomain(orm: GroupOrmEntity): Group {
    const members = this.mapMembersFromOrm(orm);
    const invitation = this.mapInvitationFromOrm(orm);

    return Group.createFromdb(
      GroupId.of(orm.id),
      GroupName.of(orm.name),
      GroupDescription.of(orm.description ?? ""),
      UserId.of(orm.adminId),
      members,
      this.emptyAssignments(),
      this.emptyCompletions(),
      invitation,
      orm.createdAt,
      orm.updatedAt,
    );
  }


  async findById(id: GroupId): Promise<Group | null> {
    const orm = await this.ormRepo.findOne({
      where: { id: id.value },
      relations: ["members"],
    });

    if (!orm) return null;
    return this.mapToDomain(orm);
  }

  async findByMember(userId: UserId): Promise<Group[]> {
    // 1) Buscar IDs de grupos donde el user es miembro
    const rows = await this.ormRepo
      .createQueryBuilder("g")
      .innerJoin("g.members", "m", "m.userId = :userId", {
        userId: userId.value,
      })
      .select("g.id", "id")
      .getRawMany<{ id: string }>();

    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);

    const orms = await this.ormRepo.find({
      where: { id: In(ids) },
      relations: ["members"],
    });

    return orms.map((orm) => this.mapToDomain(orm));
  }

  async findByInvitationToken(token: string): Promise<Group | null> {
    const orm = await this.ormRepo.findOne({
      where: { invitationToken: token },
      relations: ["members"],
    });

    if (!orm) return null;
    return this.mapToDomain(orm);
  }
}