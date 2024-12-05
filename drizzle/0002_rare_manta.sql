-- Custom SQL migration file, put your code below! --
create or replace function match_users (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  name text,
  bio text,
  matchreason text,
  similarity float
)
language sql stable
as $$
  select
    users.id,
    users.name,
    users.bio,
    users.matchreason,
    1 - (users.embedding <=> query_embedding) as similarity
  from users
  where 1 - (users.embedding <=> query_embedding) > match_threshold
  order by (users.embedding <=> query_embedding) asc
  limit match_count;
$$;