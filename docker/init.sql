create table if not exists urls (
    id serial primary key,
    short_code varchar(10) unique not null,
    original_url text not null,
    created_at timestamp default current_timestamp
);