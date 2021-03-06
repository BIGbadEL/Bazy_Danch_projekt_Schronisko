CREATE TYPE "plec" AS ENUM (
  'meski',
  'zenski',
  'sterylizowany'
);

CREATE TYPE "szczepionka" AS ENUM (
  'wscieklizna',
  'parwowiroza',
  'nosowka'
);

CREATE TABLE "Zwierzeta" (
  "Z_ID" SERIAL PRIMARY KEY,
  "imie" varchar,
  "rasa_id" int,
  "pomieszczenie_id" int,
  "Z_plec" plec,
  "wiek" int,
  "waga" int
);

CREATE TABLE "Gatunek" (
  "G_ID" SERIAL PRIMARY KEY,
  "nazwa" varchar UNIQUE
);

CREATE TABLE "Pomieszczenie" (
  "P_ID" SERIAL PRIMARY KEY,
  "numer" varchar,
  "osrodek" int,
  "pojemnosc" int
);

CREATE TABLE "Osrodek" (
  "O_ID" SERIAL PRIMARY KEY,
  "miasto" varchar,
  "adres" varchar
);

CREATE TABLE "Pracownicy" (
  "PR_ID" SERIAL PRIMARY KEY,
  "osrodek_id" int NOT NULL,
  "imie" varchar,
  "nazwisko" varchar,
  "mail" varchar UNIQUE,
  "haslo" varchar,
  "adres" varchar,
  "telefon" varchar,
  "stanowisko" varchar,
  "pensja" int
);

CREATE TABLE "Pr_Po" (
  "pomieszczenie_ID" int,
  "pracownicy_ID" int
);

CREATE TABLE "Karma" (
  "K_ID" SERIAL PRIMARY KEY,
  "gatunek_id" int,
  "ilosc" int,
  "nazwa" varchar
);

CREATE TABLE "Rasa" (
  "R_ID" SERIAL PRIMARY KEY,
  "nazwa" varchar,
  "opis" varchar,
  "gatunek_id" int
);

CREATE TABLE "Klienci" (
  "K_ID" SERIAL PRIMARY KEY,
  "imie" varchar,
  "nazwisko" varchar,
  "telefon" varchar,
  "mail" varchar UNIQUE,
  "haslo" varchar
);

CREATE TABLE "Adopcja" (
  "A_ID" SERIAL PRIMARY KEY,
  "klient_id" int,
  "gatunek_id" int,
  "A_plec" plec,
  "min_wiek" int,
  "max_wiek" int
);

CREATE TABLE "Ad_Ra" (
  "adopcja_id" int,
  "rasa_id" int
);

CREATE TABLE "Szczepienia" (
  "S_ID" SERIAL PRIMARY KEY,
  "rodzaj" szczepionka,
  "zwierze_id" int,
  "data_szczepienia" date,
  "data_warznosci" date
);

CREATE TABLE "Adopcja_udana" (
  "AU_ID" SERIAL PRIMARY KEY,
  "klient_id" int NOT NULL,
  "zwierze_id" int UNIQUE NOT NULL
);

ALTER TABLE "Zwierzeta" ADD FOREIGN KEY ("pomieszczenie_id") REFERENCES "Pomieszczenie" ("P_ID");

ALTER TABLE "Pomieszczenie" ADD FOREIGN KEY ("osrodek") REFERENCES "Osrodek" ("O_ID");

ALTER TABLE "Pr_Po" ADD FOREIGN KEY ("pracownicy_ID") REFERENCES "Pracownicy" ("PR_ID");

ALTER TABLE "Pr_Po" ADD FOREIGN KEY ("pomieszczenie_ID") REFERENCES "Pomieszczenie" ("P_ID");

ALTER TABLE "Karma" ADD FOREIGN KEY ("gatunek_id") REFERENCES "Gatunek" ("G_ID");

ALTER TABLE "Rasa" ADD FOREIGN KEY ("gatunek_id") REFERENCES "Gatunek" ("G_ID");

ALTER TABLE "Adopcja" ADD FOREIGN KEY ("klient_id") REFERENCES "Klienci" ("K_ID");

ALTER TABLE "Adopcja" ADD FOREIGN KEY ("gatunek_id") REFERENCES "Gatunek" ("G_ID");

ALTER TABLE "Ad_Ra" ADD FOREIGN KEY ("adopcja_id") REFERENCES "Adopcja" ("A_ID");

ALTER TABLE "Ad_Ra" ADD FOREIGN KEY ("rasa_id") REFERENCES "Rasa" ("R_ID");

ALTER TABLE "Pracownicy" ADD FOREIGN KEY ("osrodek_id") REFERENCES "Osrodek" ("O_ID");

ALTER TABLE "Szczepienia" ADD FOREIGN KEY ("zwierze_id") REFERENCES "Zwierzeta" ("Z_ID");

ALTER TABLE "Zwierzeta" ADD FOREIGN KEY ("rasa_id") REFERENCES "Rasa" ("R_ID");

ALTER TABLE "Adopcja_udana" ADD FOREIGN KEY ("zwierze_id") REFERENCES "Zwierzeta" ("Z_ID");

ALTER TABLE "Adopcja_udana" ADD FOREIGN KEY ("klient_id") REFERENCES "Klienci" ("K_ID");
