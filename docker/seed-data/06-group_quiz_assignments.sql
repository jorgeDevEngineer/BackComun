create table group_quiz_assignments
(
    id               uuid                     not null
        constraint "PK_7c71b1084848752726269890056"
            primary key,
    "quizId"         uuid                     not null,
    "assignedBy"     uuid                     not null,
    "createdAt"      timestamp default now()  not null,
    "availableFrom"  timestamp with time zone not null,
    "availableUntil" timestamp with time zone not null,
    "isActive"       boolean   default true   not null,
    "groupId"        uuid
        constraint "FK_40d8d0aa6eaac0f07d57974a8c9"
            references groups
            on delete cascade
);

alter table group_quiz_assignments
    owner to postgres;

INSERT INTO public.group_quiz_assignments (id, "quizId", "assignedBy", "createdAt", "availableFrom", "availableUntil", "isActive", "groupId") VALUES ('b8475b8f-3e43-4399-80bc-3da1c275221c', 'c8bf6bd7-7b4f-4e13-8d04-0ce41c9e9bf6', '123e4567-e89b-42d3-a456-426614174123', '2025-12-05 20:16:21.312147', '2025-12-05 20:16:17.272000 +00:00', '2025-12-31 23:59:00.000000 +00:00', true, 'a994e744-2750-492c-b005-51e689cc3eb2');
