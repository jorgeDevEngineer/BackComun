create table media
(
    "mediaId"  uuid                    not null
        constraint "PK_b59b16ab8334d41fd71dd9c9656"
            primary key,
    author_id  varchar                 not null,
    name       varchar                 not null,
    url        varchar                 not null,
    mime_type  varchar                 not null,
    size       integer                 not null,
    format     varchar                 not null,
    category   varchar                 not null,
    created_at timestamp default now() not null
);

alter table media
    owner to postgres;

INSERT INTO public.media ("mediaId", author_id, name, url, mime_type, size, format, category, created_at) VALUES ('66fa38b1-0a98-447d-9277-156f640605fc', '123e4567-e89b-42d3-a456-426614174123', 'theme02.png', 'https://touhrqqlyjvbtkzmokuf.supabase.co/storage/v1/object/public/kahoot/1768013887179-theme02.png', 'image/png', 772713, '.png', 'theme', '2026-01-10 02:58:07.543000');
INSERT INTO public.media ("mediaId", author_id, name, url, mime_type, size, format, category, created_at) VALUES ('efde3e60-9a25-4c27-af6d-66f2afdfa675', '123e4567-e89b-42d3-a456-426614174123', 'theme02.png', 'https://touhrqqlyjvbtkzmokuf.supabase.co/storage/v1/object/public/kahoot/1768013964072-theme02.png', 'image/png', 772713, '.png', 'theme', '2026-01-10 02:59:24.471000');
