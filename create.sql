CREATE TABLE lights (
	"id" INTEGER PRIMARY KEY,
	"index" INTEGER NOT NULL,
	"description" TEXT NOT NULL,
	"status" BOOLEAN NOT NULL
);

CREATE TABLE temperatures (
	"id" INTEGER PRIMARY KEY,
	"value" INTEGER NOT NULL,
	"timestamp" DATETIME NOT NULL
);
