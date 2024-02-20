-- CREATE DATABASE pern_chat_app

CREATE TABLE auth (
    auth_id  uuid DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    unique_code  VARCHAR(6) NOT NULL,
    password  VARCHAR(200) NOT NULL,
    chat_user_id  uuid references chat_user (chat_user_id),
    

    createdAt DATE DEFAULT NOW()::timestamp NOT NULL,
    updatedAt DATE DEFAULT NOW()::timestamp NOT NULL
);

