DROP DATABASE IF EXISTS inventory;
CREATE DATABASE inventory;

CREATE TABLE listings (
  id                  SERIAL UNIQUE NOT NULL PRIMARY KEY,
  name                VARCHAR(140),
  host_name           VARCHAR(80),
  market              VARCHAR(80),
  neighbourhood       VARCHAR(80),
  room_type           VARCHAR(40),
  average_rating      FLOAT
);

CREATE TABLE availability (
  listing_id          INT NOT NULL REFERENCES listings(id),
  inventory_date      DATE NOT NULL,
  price               MONEY
);

CREATE TABLE amenities (
  id                  SERIAL UNIQUE NOT NULL PRIMARY KEY,
  name                VARCHAR(40)
);

CREATE TABLE listing_amenities (
  listing_id          INT NOT NULL REFERENCES listings(id),
  amenity_id          INT NOT NULL REFERENCES amenities(id)
);
