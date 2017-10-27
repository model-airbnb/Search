module.exports.createTable = {
  listings: `
    CREATE TABLE listings (
      id                  SERIAL UNIQUE NOT NULL PRIMARY KEY,
      name                VARCHAR(500),
      host_name           VARCHAR(300),
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
      name                            VARCHAR(500),
      host_id                         INT,
      host_name                       VARCHAR(300),
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

const DATA_DIR = `${__dirname}/data`;

module.exports.csvImport = {
  listings: market => `COPY listings_raw_data FROM '${DATA_DIR}/listings-${market.filename}.csv' DELIMITER ',' CSV HEADER;`,
  availability: market => `COPY availability_raw_data FROM '${DATA_DIR}/availability-${market.filename}.csv' DELIMITER ',' CSV HEADER;`,
};

module.exports.addSeedData = {
  listings: market => `
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
      '${market.name}'::varchar(80) AS market,
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

module.exports.dropTable = {
  listingsRawData: 'DROP TABLE IF EXISTS listings_raw_data',
  availabilityRawData: 'DROP TABLE IF EXISTS availability_raw_data',
};
