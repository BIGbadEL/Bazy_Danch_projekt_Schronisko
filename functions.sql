CREATE OR REPLACE FUNCTION add_or_update_karma() RETURNS TRIGGER AS'
    DECLARE
    i integer;
    karma record;
    BEGIN
        SELECT ilosc INTO i FROM "Karma" WHERE "nazwa" = new.nazwa AND "gatunek_id" = new.gatunek_id;
        IF NOT FOUND THEN
            RETURN NEW;
        ELSE
            i = i + new.ilosc;
            UPDATE "Karma" SET ilosc = i WHERE "nazwa" = new.nazwa AND "gatunek_id" = new.gatunek_id;
            RETURN NULL;
        END IF;
    END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER dodaj_karme BEFORE INSERT ON "Karma"
FOR EACH ROW EXECUTE PROCEDURE add_or_update_karma();

CREATE OR REPLACE FUNCTION add_animal() RETURNS TRIGGER AS'
    DECLARE
    room "Pomieszczenie"%ROWTYPE;
    amount integer;
    BEGIN
        FOR room IN SELECT * FROM "Pomieszczenie" WHERE "osrodek" = new.pomieszczenie_id
        LOOP 
            SELECT COUNT(*) INTO amount FROM "Zwierzeta" WHERE pomieszczenie_id = room."P_ID";
            RAISE NOTICE ''%'', amount;
            IF amount < room."pojemnosc" THEN
                new.pomieszczenie_id = room."P_ID";
                RETURN NEW;
            END IF;
        END LOOP;
        RETURN NULL;
    END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER dodaj_zwierze BEFORE INSERT ON "Zwierzeta"
FOR EACH ROW EXECUTE PROCEDURE add_animal();

CREATE OR REPLACE FUNCTION add_adoption(c_id INT, g_id INT, sex "plec", min_age INT, max_age INT, rasy int[]) RETURNS int AS'
    DECLARE
    a_id int;
    animal "Zwierzeta"%ROWTYPE;
    BEGIN
        FOR i IN 1 .. array_upper(rasy, 1)
        LOOP
            FOR animal in select * from "Zwierzeta" where rasa_id=rasy[i] and "Z_plec" = sex
            LOOP 
                IF min_age <= animal.wiek AND max_age >= animal.wiek THEN
                    insert into "Adopcja_udana"("klient_id", "zwierze_id") values (c_id, animal."Z_ID");
                    RETURN 0;
                END IF;
            END LOOP;
        END LOOP;
        insert into "Adopcja" ("klient_id", "gatunek_id", "A_plec", "min_wiek", "max_wiek") values (c_id, g_id, sex, min_age, max_age);
        SELECT currval(''"Adopcja_A_ID_seq"'') into a_id;
        FOR i IN 1 .. array_upper(rasy, 1)
        LOOP
            insert into "Ad_Ra" ("adopcja_id", "rasa_id") values (a_id, rasy[i]);
        END LOOP;
        RETURN 1;
    END;
' LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION finalize_adoption() RETURNS TRIGGER AS'
    DECLARE
    z_id integer;
    BEGIN
        DELETE FROM "Zwierzeta" where "Z_ID" = old.zwierze_id;
        RETURN NEW;
    END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER usun_adopcje AFTER DELETE ON "Adopcja_udana"
FOR EACH ROW EXECUTE PROCEDURE finalize_adoption();

CREATE OR REPLACE FUNCTION vaccinate_and_check_for_adoption() RETURNS TRIGGER AS'
    DECLARE
    z_id integer;
    c_date date;
    l_date date;
    adoption "Adopcja"%ROWTYPE;
    BEGIN
        select * into c_date from current_date;
        l_date = c_date + 1;
        insert into "Szczepienia" (rodzaj, zwierze_id, data_szczepienia, data_warznosci) values (''wscieklizna'', new."Z_ID", c_date, l_date);
        l_date = c_date + 2;
        insert into "Szczepienia" (rodzaj, zwierze_id, data_szczepienia, data_warznosci) values (''parwowiroza'', new."Z_ID", c_date, l_date);
        l_date = c_date + 4;
        insert into "Szczepienia" (rodzaj, zwierze_id, data_szczepienia, data_warznosci) values (''nosowka'', new."Z_ID", c_date, l_date);
        FOR adoption in  select "A_ID", klient_id, gatunek_id, "A_plec", min_wiek, max_wiek from "Adopcja" as A join "Ad_Ra" as AR on "A_ID" = adopcja_id where rasa_id = new.rasa_id and "A_plec" = new."Z_plec"
            LOOP 
                IF adoption.min_wiek <= new.wiek AND adoption.max_wiek >= new.wiek THEN
                    insert into "Adopcja_udana"("klient_id", "zwierze_id") values (adoption.klient_id, new."Z_ID");
                    delete from "Adopcja" where "A_ID" = adoption."A_ID";
                    RETURN NEW;
                END IF;
            END LOOP;
        RETURN NEW;
    END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER animals_update_handler AFTER INSERT ON "Zwierzeta"
FOR EACH ROW EXECUTE PROCEDURE vaccinate_and_check_for_adoption();

CREATE OR REPLACE FUNCTION clean_up_adoption() RETURNS TRIGGER AS'
    DECLARE
    z_id integer;
    BEGIN
        DELETE FROM "Ad_Ra" where adopcja_id = old."A_ID";
        raise notice ''clean_up_adoption: %'', old;
        RETURN old;
    END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER delete_adoption BEFORE DELETE ON "Adopcja"
FOR EACH ROW EXECUTE PROCEDURE clean_up_adoption();

CREATE OR REPLACE FUNCTION clean_up_animal() RETURNS TRIGGER AS'
    BEGIN
        DELETE FROM "Szczepienia" where zwierze_id = old."Z_ID";
        RETURN old;
    END;
' LANGUAGE 'plpgsql';

CREATE TRIGGER delete_animal BEFORE DELETE ON "Zwierzeta"
FOR EACH ROW EXECUTE PROCEDURE clean_up_animal();

CREATE TYPE "szczepionka" AS ENUM (
  'wscieklizna',
  'parwowiroza',
  'nosowka'
);

CREATE OR REPLACE FUNCTION update_vac(s_id int) RETURNS void AS'
    declare
    c_date date;
    l_date date;
    v_type "szczepionka";
    BEGIN
        select * into c_date from current_date;
        select rodzaj into v_type from "Szczepienia" where "S_ID" = s_id;
        IF v_type = ''wscieklizna''::"szczepionka" THEN
            l_date = c_date + 1;
            raise notice ''1Value: %'', l_date;
        ELSEIF v_type = ''parwowiroza''::"szczepionka" THEN
            l_date = c_date + 2;
            raise notice ''2Value: %'', l_date;
        ELSE 
            l_date = c_date + 3;
            raise notice ''3Value: %'', l_date;
        END IF;
        raise notice ''4Value: %'', l_date;
        
        update "Szczepienia" SET data_szczepienia = c_date, data_warznosci = l_date where "S_ID" = s_id;
    END;
' LANGUAGE 'plpgsql';

CREATE OR REPLACE FUNCTION is_valid_center_location() RETURNS TRIGGER AS'
    DECLARE
    artykul record;
    BEGIN
    SELECT * INTO artykul FROM "Osrodek" WHERE miasto = new.miasto AND adres = new.adres;
    IF NOT FOUND THEN
            RAISE NOTICE ''Wszystko dobrze - nie ma takiego rekordu w tablicy-wstawiamy'';
            RETURN NEW;
    ELSE
            RAISE EXCEPTION ''BLAD – Taki rekord juz istnieje !'';
            RETURN NULL;
    END IF;
    END;
' LANGUAGE 'plpgsql';


CREATE TRIGGER add_center BEFORE INSERT ON "Osrodek"
FOR EACH ROW EXECUTE PROCEDURE is_valid_center_location();

