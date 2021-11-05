-- NOTE: Only run this script during the initial setup or don't care about stored data

-- Wipe database & user if existing
DROP DATABASE IF EXISTS ufotomi;
DROP USER IF EXISTS ufotomi_user@localhost;

-- Create UFOTOMI database & ensure Unicode is fully supported
CREATE DATABASE ufotomi CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
-- Create UFOTOMI user (with full privileges)
CREATE USER ufotomi_user@localhost IDENTIFIED WITH mysql_native_password BY 'ufotomi77@';
GRANT ALL PRIVILEGES ON ufotomi.* TO ufotomi_user@localhost;
