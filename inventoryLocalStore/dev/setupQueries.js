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
    COPY listings_raw_data FROM '${__dirname}/seedData/ListingSummaryInformation-SF.csv' DELIMITER ',' CSV HEADER;
  `,
  availability: `
    COPY availability_raw_data FROM '${__dirname}/seedData/Availability-SF.csv' DELIMITER ',' CSV HEADER;
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

module.exports.createTableQueries = createTableQueries;
module.exports.csvImportQueries = csvImportQueries;
module.exports.addSeedDataQueries = addSeedDataQueries;
