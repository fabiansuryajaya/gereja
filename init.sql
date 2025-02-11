CREATE database greja;
use greja;
create table users(
	username varchar(50) not null,
	password varchar(50) not null,
	properties json null,
	status smallint(1) unsigned not null default 0
);
INSERT INTO users
(username, password, properties, status)
VALUES('admin', 'admin', '{}', 1);


CREATE TABLE IF NOT EXISTS account (
    kode VARCHAR(10) NOT NULL,
    kategori VARCHAR(100) NOT NULL,
    sub_kategori VARCHAR(100) NOT NULL,
    ref VARCHAR(100) NOT NULL,
    alokasi VARCHAR(100) NOT NULL,
    method ENUM('debit', 'kredit') NOT NULL,
    PRIMARY KEY (kode, kategori, sub_kategori, ref, alokasi)
);