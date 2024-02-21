CREATE TABLE chat (
    chat_id uuid DEFAULT uuid_generate_v4() PRIMARY KEY NOT NULL,
    participants uuid[] NOT NULL,
    is_group_chat BOOLEAN Default false,
    group_admin uuid references chat_user(chat_user_id),
    chat_name VARCHAR(50),
    chat_pic VARCHAR(255)  DEFAULT 'http://',
    latestMsg uuid references msg(msg_id),

    createdAt TIMESTAMP DEFAULT NOW() NOT NULL,
    updatedAt TIMESTAMP DEFAULT NOW() NOT NULL
);
    FOREIGN KEY (participants) REFERENCES chat_user(chat_user_id)
