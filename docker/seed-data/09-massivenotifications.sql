create table massivenotifications
(
    id          varchar   not null
        constraint "PK_6739247dfafd10b4e7991d9d64a"
            primary key,
    title       varchar   not null,
    message     varchar   not null,
    "userId"    varchar   not null,
    "createdAt" timestamp not null
);

alter table massivenotifications
    owner to postgres;

INSERT INTO public.massivenotifications (id, title, message, "userId", "createdAt") VALUES ('5bdf3642-fbfe-4191-a8c0-5d04439f0f51', 'Notificacion de Prueba', 'Hola mundo', '9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', '2026-01-07 19:27:24.547000');
INSERT INTO public.massivenotifications (id, title, message, "userId", "createdAt") VALUES ('108901f7-e13f-4e37-8a47-0c990bdf1bd0', 'Notificacion de Prueba', 'Hola mundo', '9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', '2026-01-08 10:31:59.017000');
INSERT INTO public.massivenotifications (id, title, message, "userId", "createdAt") VALUES ('127c28aa-260e-442f-ace2-2faa46ae84ae', 'Notificacion de Prueba (solo admins)', 'Hola mundo', '9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', '2026-01-09 13:19:57.989000');
INSERT INTO public.massivenotifications (id, title, message, "userId", "createdAt") VALUES ('1c46ea19-eef1-4870-be2d-ce1d8d871393', 'Notificacion de Prueba (solo admins)', 'Hola mundo', '9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', '2026-01-09 20:37:49.320000');
INSERT INTO public.massivenotifications (id, title, message, "userId", "createdAt") VALUES ('8cb31c02-d653-42fe-b5e9-694d3de8a53d', 'Notificacion de Prueba (solo admins)', 'Hola mundo 222', '9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', '2026-01-09 20:38:20.324000');
INSERT INTO public.massivenotifications (id, title, message, "userId", "createdAt") VALUES ('2c127ede-1169-49f2-942c-7f278ab44f50', 'Notificacion de Prueba (solo admins)', 'Hola mundo 222', '9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', '2026-01-09 22:09:00.368000');
INSERT INTO public.massivenotifications (id, title, message, "userId", "createdAt") VALUES ('4e2d3d18-2559-46d8-b830-9b98002cbe82', 'Notificacion de Prueba (solo admins)', 'Hola mundo 222', '9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', '2026-01-12 12:03:20.332000');
INSERT INTO public.massivenotifications (id, title, message, "userId", "createdAt") VALUES ('6322b7c8-94f1-45a8-851f-b2adaeed5679', 'Notificacion de Prueba (solo admins)', 'Hola mundo 222', '9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', '2026-01-12 12:03:31.526000');
INSERT INTO public.massivenotifications (id, title, message, "userId", "createdAt") VALUES ('e6d46329-e8e5-414f-9c80-6aee7938bbd2', 'Notificacion de Prueba (solo admins)', 'Hola mundo 222', '9fa9df55-a70b-47cb-9f8d-ddb8d2c3c76a', '2026-01-12 12:04:46.724000');
