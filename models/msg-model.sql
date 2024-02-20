create table msg (
    msg_id uuid Default uuid_generate_v4() primary key not null,
    chat_user_id uuid references chat_user (chat_user_id) not null,
    content varchar(255),

    createdAt Date Default now()::timestamp not null,
    updatedAt Date Default now()::timestamp not null
    
);
    chat_id uuid references chat(chat_id) not null,