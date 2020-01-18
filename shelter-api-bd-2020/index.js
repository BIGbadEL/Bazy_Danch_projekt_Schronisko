const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { pool } = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const getCustomer = (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  pool.query('SELECT "K_ID" FROM "Klienci" WHERE "mail"=$1 AND "haslo"=$2', [email, password], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getInfoCustomer = (request, response) => {
  const k_id = request.body.k_id;
  pool.query('SELECT "imie", "nazwisko", "telefon", "mail" FROM "Klienci" WHERE "K_ID"=$1', [k_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const addCustomer = (request, response) => {
  const name = request.body.name;
  const surname = request.body.surname;
  const number = request.body.number;
  const email = request.body.email;
  const password = request.body.password;
  pool.query('insert into "Klienci" ("imie", "nazwisko", "telefon", "mail", "haslo") values ($1, $2, $3, $4, $5);', [name, surname, number, email, password], error => {
    if (error) {
      console.log(error);
      response.status(409).json({ status: 'failed', message: 'email already exists' });
    } else {
      response.status(201).json({ status: 'success', message: 'Customer added.' });
    }
  });
};

const loginWorker = (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  pool.query('SELECT "PR_ID" FROM "Pracownicy" WHERE "mail"=$1 AND "haslo"=$2', [email, password], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const infoWorker = (request, response) => {
  const p_id = request.body.p_id;
  pool.query('SELECT "imie", "nazwisko", "stanowisko", "telefon", "mail" FROM "Pracownicy" WHERE "PR_ID"=$1', [p_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getAllCenters = (request, response) => {
  pool.query('SELECT * FROM "Osrodek";', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const addRoom = (request, response) => {
  const o_id = parseInt(request.body.o_id); 
  const capacity = parseInt(request.body.capacity);
  const number = request.body.number;
  pool.query('insert into "Pomieszczenie" ("numer", "osrodek", "pojemnosc") values ($1, $2, $3);', [number, o_id, capacity], error => {
    if (error) {
      console.log(error);
    } else {
      response.status(201).json({ status: 'success', message: 'Customer added.' });
    }
  });
};

const addCenter = (request, response) => {
  const city = request.body.city;
  const address = request.body.address;
  pool.query('insert into "Osrodek" ("miasto", "adres") values ($1, $2);', [city, address], error => {
    if (error){
      response.status(409).json({ status: 'failed', message: 'center already exists' });
    } else {
      response.status(201).json({ status: 'success', message: 'Customer added.' });
    }

  });
};

const addWorker = (request, response) => {
  const o_id = parseInt(request.body.o_id);
  const name = request.body.name;
  const surname = request.body.surname;
  const email = request.body.email;
  const password = request.body.password;
  const address = request.body.address;
  const number = request.body.number;
  const position = request.body.position;
  const salary = parseInt(request.body.salary);
  pool.query('insert into "Pracownicy" ("osrodek_id", "imie","nazwisko", "mail", "haslo", "adres", "telefon", "stanowisko", "pensja") values ($1, $2, $3, $4, $5, $6, $7, $8, $9);', [o_id, name, surname, email, password, address, number, position, salary], error => {
    if (error) {
      console.log(error);
      response.status(409).json({ status: 'failed', message: 'email already exists' });
    } else {
      response.status(201).json({ status: 'success', message: 'Customer added.' });
    }
  });
};

const addSpecies = (request, response) => {
  const name = request.body.name;
  pool.query('insert into "Gatunek" ("nazwa") values ($1);', [name], error => {
    if (error) 
      throw error;
    response.status(201).json({ status: 'success', message: 'Species added.' });
  });
};

const addBreed = (request, response) => {
  const name = request.body.name;
  const description = request.body.description;
  const g_id = parseInt(request.body.g_id);
  pool.query('insert into "Rasa" ("nazwa", "opis", "gatunek_id") values ($1, $2, $3);', [name, description, g_id], error => {
    if (error) 
      throw error;
    response.status(201).json({ status: 'success', message: 'Breed added.' });
  });
};

const getAllSpecies = (request, response) => {
  pool.query('SELECT * FROM "Gatunek";', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const addFeed = (request, response) => {
  const g_id = parseInt(request.body.g_id);
  const ilosc = parseInt(request.body.amount);
  const name = request.body.name;
  pool.query('insert into "Karma" ("gatunek_id", "ilosc", "nazwa") values ($1, $2, $3);', [ g_id, ilosc, name], error => {
    if (error) 
      throw error;
    response.status(201).json({ status: 'success', message: 'Feed added.' });
  });
};

const getBreedByID = (request, response) => {
  const g_id = parseInt(request.params.g_id);
  pool.query('SELECT "R_ID", nazwa, opis FROM "Rasa" WHERE gatunek_id = $1;', [g_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const addAnimal = (request, response) => {
  const name = request.body.name;
  const g_id = parseInt(request.body.g_id);
  const c_id = parseInt(request.body.c_id);
  const sex = request.body.sex;
  const age = parseInt(request.body.age);
  const weight = parseInt(request.body.weight);
  pool.query(`insert into "Zwierzeta" ("imie", "rasa_id", "pomieszczenie_id", "Z_plec", "wiek", "waga") values ($1, $2, $3, $4, $5, $6);`, [name, g_id, c_id, sex, age, weight], error => {
    if (error) 
      throw error;
    response.status(201).json({ status: 'success', message: 'Animal added.' });
  });
};

const addAdoption = (request, response) => {
  console.log(request.body);
  const c_id = request.body.c_id;
  const g_id = request.body.g_id;
  const sex = request.body.sex;
  const min_age = request.body.min_age;
  const max_age = request.body.max_age;
  const breeds = request.body.breeds;
  
  pool.query(`Select * from add_adoption($1, $2, $3, $4, $5, $6);`, [c_id, g_id, sex, min_age, max_age, breeds], error => {
    if (error) 
      console.log(error);
    response.status(201).json({ status: 'success', message: 'Adoption added.' });
  });
};

const getAllAnimals = (request, response) => {
  pool.query('select Z."Z_ID", Z.imie, R.nazwa, Z."Z_plec", Z.wiek, Z.waga, Au."AU_ID" FROM "Zwierzeta" as Z join "Rasa" as R ON Z.rasa_id = R."R_ID" left join "Adopcja_udana" as Au On Au.zwierze_id = Z."Z_ID";', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const AddReadyAdoption = (request, response) => {
  const c_id = parseInt(request.body.c_id); 
  const a_id = parseInt(request.body.a_id);
  pool.query('insert into "Adopcja_udana"("klient_id", "zwierze_id") values ($1, $2);', [c_id, a_id], (error, results) => {
    if (error) {
      console.log(error);
    }
    response.status(201).json({ status: 'success', message: 'Adoption finalized.' });
  });
};

const GetAdoptionsByClientID = (request, response) => {
  const c_id = parseInt(request.params.c_id);
  pool.query('select A."A_plec", A."min_wiek", A."max_wiek", R."nazwa" from "Adopcja" as A join "Ad_Ra" as Ad on a."A_ID" = Ad.adopcja_id join "Rasa" as R on Ad.rasa_id = R."R_ID" where A.klient_id = $1;', [c_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const GetReadyAdoptionsByClientID = (request, response) => {
  const c_id = parseInt(request.params.c_id);
  pool.query('select A."AU_ID", Z.imie, R.nazwa, Z."Z_plec", Z.wiek, Z.waga from "Adopcja_udana" as A join "Zwierzeta" as Z on A.zwierze_id = Z."Z_ID" join "Rasa" as R On Z.rasa_id = R."R_ID" where A.klient_id = $1;', [c_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const finalizeAdoption = (request, response) => {
  const ad_id = parseInt(request.body.ad_id);
  pool.query(`DELETE FROM "Adopcja_udana" where "AU_ID" = $1;`, [ad_id], error => {
    if (error) 
      throw error;
    response.status(201).json({ status: 'success', message: 'Adoption finalized.' });
  });
};

const getSpeciesAndBreed = (request, response) => {
  pool.query('select G.nazwa, R.nazwa, opis from "Rasa" as R join "Gatunek" as G on R."gatunek_id" = G."G_ID";', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getWorkersByCenterID = (request, response) => {
  const c_id = parseInt(request.params.c_id);
  pool.query('select imie, nazwisko, mail, telefon, stanowisko, pensja from "Pracownicy" where osrodek_id = $1;', [c_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getVaccinationByAnimalID = (request, response) => {
  const z_id = parseInt(request.params.z_id);
  pool.query('select * from "Szczepienia" where zwierze_id = $1;', [z_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const updateVac = (request, response) => {
  const s_id = parseInt(request.body.s_id);
  pool.query('select * from update_vac($1);', [s_id], (error, results) => {
    if (error) {
      console.log(error);
    }
    response.status(201).json({ status: 'success', message: 'Vac updated.' });
  });
};

const getAllRooms = (request, response) => {
  pool.query('select * from "Pomieszczenie" ;', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getCorrectWorkersForRoom  = (request, response) => {
  const c_id = parseInt(request.params.c_id);
  const r_id = parseInt(request.params.r_id);
  pool.query('select * from "Pracownicy" where osrodek_id=$1 AND "PR_ID" NOT IN(select "pracownicy_ID" from "Pr_Po" where "pomieszczenie_ID" = $2);', [c_id, r_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const addToPr_Po = (request, response) => {
  const r_id = parseInt(request.body.r_id);
  const w_id = parseInt(request.body.w_id);
  pool.query('insert into "Pr_Po" values ($1, $2);', [r_id, w_id], (error, results) => {
    if (error) {
      console.log(error);
    }
    response.status(201).json({ status: 'success', message: 'Added to Pr_Po' });
  });
};

const getNumberOfAnimalsPerRoom = (request, response) => {
  const r_id = parseInt(request.params.r_id);
  pool.query('select count(*) from "Zwierzeta" where pomieszczenie_id=$1;', [r_id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

app.route('/customer_log').post(getCustomer);
app.route('/customer_reg').post(addCustomer);
app.route('/customer_info').post(getInfoCustomer);
app.route('/worker_log').post(loginWorker);
app.route('/worker_info').post(infoWorker);
app.route('/get_all_centers').get(getAllCenters);
app.route('/add_room').post(addRoom);
app.route('/add_center').post(addCenter);
app.route('/add_worker').post(addWorker);
app.route('/add_species').post(addSpecies);
app.route('/get_all_species').get(getAllSpecies);
app.route('/add_breed').post(addBreed);
app.route('/add_feed').post(addFeed);
app.route('/get_breed_by_id/:g_id').get(getBreedByID);
app.route('/add_animal').post(addAnimal);
app.route('/add_adoption').post(addAdoption);
app.route('/get_all_animals').get(getAllAnimals);
app.route('/add_ready_adoption').post(AddReadyAdoption);
app.route('/get_adoptions/:c_id').get(GetAdoptionsByClientID);
app.route('/get_ready_adoption/:c_id').get(GetReadyAdoptionsByClientID);
app.route('/finalize_adoption').post(finalizeAdoption);
app.route('/get_species_and_breeds').get(getSpeciesAndBreed);
app.route('/get_workers/:c_id').get(getWorkersByCenterID);
app.route('/get_vaccination/:z_id').get(getVaccinationByAnimalID);
app.route('/update_vac').post(updateVac);
app.route('/get_all_rooms').get(getAllRooms);
app.route('/get_workers_for_room/:c_id/:r_id').get(getCorrectWorkersForRoom);
app.route('/add_worker_to_room').post(addToPr_Po);
app.route('/get_number_of_animals/:r_id').get(getNumberOfAnimalsPerRoom);



app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening`);
});