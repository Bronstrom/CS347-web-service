-- NOTE: This script wipes away exisiting table information

DROP TABLE IF EXISTS photo;

CREATE TABLE photo (
  id 		SERIAL PRIMARY KEY NOT NULL,
  year 		INT,
  month		INT,
  day 		INT,
  imgName 	TEXT,
  imgDesc 	TEXT,
  imgLink 	TEXT,
  tag		TEXT,
  amazing	INT DEFAULT 0,
  nice		INT DEFAULT 0,
  meh		INT DEFAULT 0,
  boo		INT DEFAULT 0,
  popRate	INT DEFAULT 0,
  is_deleted	INT DEFAULT 0
);
