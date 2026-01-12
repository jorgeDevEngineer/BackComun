create table users
(
    id                    varchar                      not null
        constraint "PK_a3ffb1c0c8416b9fc6f907b7433"
            primary key,
    "userName"            varchar                      not null,
    email                 varchar                      not null,
    "hashedPassword"      varchar                      not null,
    "userType"            varchar                      not null,
    "avatarAssetId"       varchar                      not null,
    name                  varchar                      not null,
    theme                 varchar                      not null,
    language              varchar                      not null,
    "gameStreak"          integer                      not null,
    "createdAt"           timestamp                    not null,
    "updatedAt"           timestamp                    not null,
    description           varchar,
    roles                 text    default 'user'::text not null,
    isadmin               boolean default false        not null,
    "membershipType"      varchar                      not null,
    "membershipStartedAt" timestamp                    not null,
    "membershipExpiresAt" timestamp                    not null,
    status                varchar                      not null
);

alter table users
    owner to postgres;

INSERT INTO public.users (id, "userName", email, "hashedPassword", "userType", "avatarAssetId", name, theme, language, "gameStreak", "createdAt", "updatedAt", description, roles, isadmin, "membershipType", "membershipStartedAt", "membershipExpiresAt", status) VALUES ('123e4567-e89b-42d3-a456-426614174123', 'Dieguito', 'diegod.yeah@gmail.com', '$2a$12$PEfgHQ4WvggxaQbC8/ygBeqj1wQTUkd4GIgQOmDREeoTP.Wrz92eK', 'STUDENT', 'asset-1', 'eldiego', 'LIGHT', 'es', 0, '2025-12-05 21:20:17.404000', '2025-12-05 21:20:17.404000', null, 'user', false, 'free', '1970-01-01 00:00:00.000000', '1970-01-01 00:00:00.000000', 'active');
INSERT INTO public.users (id, "userName", email, "hashedPassword", "userType", "avatarAssetId", name, theme, language, "gameStreak", "createdAt", "updatedAt", description, roles, isadmin, "membershipType", "membershipStartedAt", "membershipExpiresAt", status) VALUES ('880fae8c-28ab-4012-8c39-3ae1b5c0ed4b', 'Fulano', 'diegod.yeah@gmail.com', '$2a$12$PEfgHQ4WvggxaQbC8/ygBeqj1wQTUkd4GIgQOmDREeoTP.Wrz92eK', 'STUDENT', 'asset-3', 'Fulaneitor', 'LIGHT', 'es', 2, '2025-12-05 14:44:53.119000', '2025-12-05 21:17:41.680000', null, 'user', false, 'free', '1970-01-01 00:00:00.000000', '1970-01-01 00:00:00.000000', 'active');
INSERT INTO public.users (id, "userName", email, "hashedPassword", "userType", "avatarAssetId", name, theme, language, "gameStreak", "createdAt", "updatedAt", description, roles, isadmin, "membershipType", "membershipStartedAt", "membershipExpiresAt", status) VALUES ('447d51fb-8b2d-4a0c-b0dc-c2469909784c', 'Diegox', 'diegoxSIUUUU@gmail.com', '$2a$12$PEfgHQ4WvggxaQbC8/ygBeqj1wQTUkd4GIgQOmDREeoTP.Wrz92eK', 'STUDENT', 'asset-4', 'SuperDiego', 'DARK', 'es', 7, '2025-12-26 01:14:22.577000', '2025-12-28 21:24:44.659000', null, 'user', false, 'free', '1970-01-01 00:00:00.000000', '1970-01-01 00:00:00.000000', 'active');
INSERT INTO public.users (id, "userName", email, "hashedPassword", "userType", "avatarAssetId", name, theme, language, "gameStreak", "createdAt", "updatedAt", description, roles, isadmin, "membershipType", "membershipStartedAt", "membershipExpiresAt", status) VALUES ('9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', 'Diegod', 'diegod.yeah@gmail.com', '$2a$12$PEfgHQ4WvggxaQbC8/ygBeqj1wQTUkd4GIgQOmDREeoTP.Wrz92eK', 'STUDENT', 'asset-6', 'Dieguito', 'LIGHT', 'es', 0, '2025-12-05 21:20:17.404000', '2025-12-05 21:20:17.404000', null, 'user', true, 'free', '1970-01-01 00:00:00.000000', '1970-01-01 00:00:00.000000', 'active');
INSERT INTO public.users (id, "userName", email, "hashedPassword", "userType", "avatarAssetId", name, theme, language, "gameStreak", "createdAt", "updatedAt", description, roles, isadmin, "membershipType", "membershipStartedAt", "membershipExpiresAt", status) VALUES ('f1986c62-7dc1-47c5-9a1f-03d34043e8f4', 'Fedelobo', 'federix@gmail.com', '$2a$12$PEfgHQ4WvggxaQbC8/ygBeqj1wQTUkd4GIgQOmDREeoTP.Wrz92eK', 'STUDENT', 'asset-7', 'elfede', 'DARK', 'es', 7, '2025-12-05 11:46:44.586000', '2025-12-05 21:18:31.267000', null, 'user', false, 'free', '1970-01-01 00:00:00.000000', '1970-01-01 00:00:00.000000', 'active');
INSERT INTO public.users (id, "userName", email, "hashedPassword", "userType", "avatarAssetId", name, theme, language, "gameStreak", "createdAt", "updatedAt", description, roles, isadmin, "membershipType", "membershipStartedAt", "membershipExpiresAt", status) VALUES ('49c11130-6572-4526-b7a0-5dd783a8a33a', 'LibraryPrueba', 'library@gmail.com', '$2a$12$PEfgHQ4WvggxaQbC8/ygBeqj1wQTUkd4GIgQOmDREeoTP.Wrz92eK', 'STUDENT', 'asset-2', 'Prueba', 'LIGHT', 'es', 0, '2025-12-30 20:04:17.662000', '2025-12-30 20:04:17.662000', null, 'user', false, 'free', '1970-01-01 00:00:00.000000', '1970-01-01 00:00:00.000000', 'active');
INSERT INTO public.users (id, "userName", email, "hashedPassword", "userType", "avatarAssetId", name, theme, language, "gameStreak", "createdAt", "updatedAt", description, roles, isadmin, "membershipType", "membershipStartedAt", "membershipExpiresAt", status) VALUES ('d089d274-71e7-430c-9389-e5fd11ba37f4', 'arausy', 'arausy@gmail.com', '$2a$12$PEfgHQ4WvggxaQbC8/ygBeqj1wQTUkd4GIgQOmDREeoTP.Wrz92eK', 'STUDENT', 'asset-5', 'Arausy', 'LIGHT', 'es', 0, '2026-01-04 02:53:20.832000', '2026-01-04 02:53:20.832000', null, 'user', false, 'free', '2026-01-04 02:53:20.832000', '2026-01-04 02:53:20.832000', 'active');
