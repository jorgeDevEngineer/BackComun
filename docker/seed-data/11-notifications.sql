create table notifications
(
    id           uuid                                                       not null
        primary key,
    "userId"     varchar                                                    not null,
    message      text                                                       not null,
    type         varchar                  default 'INFO'::character varying not null,
    "isRead"     boolean                  default false,
    "resourceId" varchar,
    "createdAt"  timestamp with time zone default CURRENT_TIMESTAMP
);



INSERT INTO public.notifications (id, "userId", message, type, "isRead", "resourceId", "createdAt") VALUES ('476b6558-cabf-4c7d-9eab-7dfef74d369b', '123e4567-e89b-42d3-a456-426614174000', 'El administrador ha asignado un nuevo quiz en el grupo Grupo pruba BackP. ¡Juégalo antes de que venza!', 'quiz_assigned', false, '02279ed1-b3dc-4b20-8680-964ba0b6f1b5', '2026-01-13 04:18:32.922000 +00:00');
INSERT INTO public.notifications (id, "userId", message, type, "isRead", "resourceId", "createdAt") VALUES ('5069ad77-aa5c-473f-93c0-92f5afee0237', '123e4567-e89b-42d3-a456-426614174000', 'El administrador ha asignado un nuevo quiz en el grupo Grupo pruba BackP. ¡Juégalo antes de que venza!', 'quiz_assigned', false, '02279ed1-b3dc-4b20-8680-964ba0b6f1b5', '2026-01-13 04:19:00.353000 +00:00');
