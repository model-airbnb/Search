// This script tears down all existing database artifacts for the service, sets
// them up from scratch and populates the tables with some seed data.

const { Pool } = require('pg');
const { database, pgConnection, dbConnection } = require('./config');

const createTableQueries = {
  listings: `
    CREATE TABLE listings (
      id                  SERIAL UNIQUE NOT NULL PRIMARY KEY,
      name                VARCHAR(140),
      host_name           VARCHAR(80),
      market              VARCHAR(80),
      neighbourhood       VARCHAR(80),
      room_type           VARCHAR(40),
      average_rating      FLOAT
    );
   `,
  availability: `
    CREATE TABLE availability (
      listing_id          INT NOT NULL REFERENCES listings(id),
      inventory_date      DATE NOT NULL,
      price               MONEY
    );
  `,
  listingsRawData: `
    CREATE TABLE listings_raw_data (
      id                              INT,
      name                            VARCHAR(140),
      host_id                         INT,
      host_name                       VARCHAR(40),
      neighbourhood_group             VARCHAR(40),
      neighbourhood                   VARCHAR(40),
      latitude                        FLOAT,
      longitude                       FLOAT,
      room_type                       VARCHAR(40),
      price                           INT,
      minimum_nights                  INT,
      number_of_reviews               INT,
      last_review                     DATE,
      reviews_per_month               FLOAT,
      calculated_host_listings_count  INT,
      availability_365                INT
    );
  `,
  availabilityRawData: `
    CREATE TABLE availability_raw_data (
      listing_id                      INT,
      inventory_date                  VARCHAR(20),
      available                       BOOLEAN,
      price                           MONEY
    );
  `,
};

const csvImportQueries = {
  listings: `
    COPY listings_raw_data FROM '${__dirname}/starterData/ListingSummaryInformation-SF.csv' DELIMITER ',' CSV HEADER;
  `,
  availability: `
    COPY availability_raw_data FROM '${__dirname}/starterData/Availability-SF.csv' DELIMITER ',' CSV HEADER;
  `,
};

const addSeedDataQueries = {
  listings: `
    INSERT INTO listings (
      id,
      name,
      host_name,
      market,
      neighbourhood,
      room_type,
      average_rating
    )
    SELECT
      id,
      name,
      host_name,
      'San Francisco'::varchar(80) AS market,
      neighbourhood,
      room_type,
      floor(random() * 100) AS average_rating
    FROM listings_raw_data;
  `,
  availability: `
    INSERT INTO availability (
      listing_id,
      inventory_date,
      price
    )
    SELECT
      listing_id,
      to_date(inventory_date, 'YYYY-MM-DD') AS inventory_date,
      price
    FROM availability_raw_data
    WHERE available = 't';
  `,
};

// Connect first to the postgres database to manage inventory database drop/create
let pool = new Pool({
  connectionString: pgConnection,
});

// Drop the existing inventory database and create a new one
pool.query(`DROP DATABASE IF EXISTS ${database}`)
  .then(() => pool.query(`CREATE DATABASE ${database}`))
  .then(() => pool.end())
  // Connect to the inventory database to create local inventory store tables
  .then(() => {
    pool = new Pool({ connectionString: dbConnection });
    return pool.query(createTableQueries.listings);
  })
  .then(() => pool.query(createTableQueries.availability))
  // Create temp tables for CSV imports
  .then(() => pool.query(createTableQueries.listingsRawData))
  .then(() => pool.query(createTableQueries.availabilityRawData))
  .then(() => pool.query(csvImportQueries.listings))
  .then(() => pool.query(csvImportQueries.availability))
  // Add seed data to inventory store tables
  .then(() => pool.query(addSeedDataQueries.listings))
  .then(() => pool.query(addSeedDataQueries.availability))
  .then(() => pool.end())
  .then(() => {
    console.log('INVENTORY STORE: All tables created and seeded with data.');
  })
  .catch((err) => {
    console.error(err);
    pool.end();
  });
