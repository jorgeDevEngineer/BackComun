create type "multiplayerSessions_sessionstate_enum" as enum ('lobby', 'question', 'results', 'end');

create table "multiplayerSessions"
(
    "sessionId"                varchar                                 not null
        constraint "PK_47ab243ea423c06b3adac07f1ff"
            primary key,
    "hostId"                   varchar                                 not null,
    "quizId"                   varchar                                 not null,
    "sessionPin"               varchar                                 not null,
    "startedAt"                timestamp                               not null,
    "completedAt"              timestamp                               not null,
    "currentQuestionStartTime" timestamp                               not null,
    "sessionState"             "multiplayerSessions_sessionstate_enum" not null,
    leaderboard                json default '[]'::json                 not null,
    progress                   json                                    not null,
    players                    json default '[]'::json                 not null,
    "playersAnswers"           json default '[]'::json                 not null
);

alter table "multiplayerSessions"
    owner to postgres;

