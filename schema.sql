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
  imgAmazing	INT,
  imgNice	INT,
  imgMeh	INT,
  imgBoo	INT,
  is_deleted	INT DEFAULT 0
);
