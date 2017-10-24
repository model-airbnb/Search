module.exports.createTableQueries = {
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
};

module.exports.csvExportQueries = {
  listings: `
    COPY (SELECT * FROM listings WHERE average_rating > 70 FETCH FIRST 5 ROWS ONLY)
    TO '${__dirname}/listings-test.csv' DELIMITER ',' CSV HEADER;
  `,
  availability: `
    COPY (SELECT * FROM availability WHERE listing_id IN
      (SELECT id FROM listings WHERE average_rating > 70 FETCH FIRST 5 ROWS ONLY))
    TO '${__dirname}/availability-test.csv' DELIMITER ',' CSV HEADER;
  `,
};

module.exports.csvImportQueries = {
  listings: `
    COPY listings FROM '${__dirname}/listings-test.csv' DELIMITER ',' CSV HEADER;
  `,
  availability: `
    COPY availability FROM '${__dirname}/availability-test.csv' DELIMITER ',' CSV HEADER;
  `,
};
