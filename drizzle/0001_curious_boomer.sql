CREATE TABLE IF NOT EXISTS "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(2048) NOT NULL,
	"bio" varchar(2048),
	"matchreason" varchar(2048),
	"attributes" varchar(2048),
	"embedding" vector(768)
);