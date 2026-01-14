create table notification_devices
(
    token        varchar not null
        primary key,
    "userId"     varchar not null,
    "deviceType" varchar not null,
    "createdAt"  timestamp with time zone default CURRENT_TIMESTAMP,
    "updatedAt"  timestamp with time zone default CURRENT_TIMESTAMP
);



INSERT INTO public.notification_devices (token, "userId", "deviceType", "createdAt", "updatedAt") VALUES ('fcm-token-simulado-android-1234567898', '123e4567-e89b-42d3-a456-426614174123', 'android', '2026-01-12 22:05:17.791772 +00:00', '2026-01-13 02:47:51.328539 +00:00');
