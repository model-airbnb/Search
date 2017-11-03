DROP DATABASE IF EXISTS inventory;
CREATE DATABASE inventory;

CREATE TABLE listings (
  id                  SERIAL UNIQUE NOT NULL PRIMARY KEY,
  name                VARCHAR(500),
  host_name           VARCHAR(300),
  market              VARCHAR(80),
  neighbourhood       VARCHAR(80),
  room_type           VARCHAR(40),
  average_rating      FLOAT
);

CREATE INDEX listings_market ON listings (market);

CREATE TABLE availability (
  listing_id          INT NOT NULL REFERENCES listings(id),
  market              VARCHAR(80) NOT NULL,
  inventory_date      DATE NOT NULL,
  price               MONEY
);

CREATE INDEX availability_inventory_date ON availability (inventory_date);
CREATE INDEX availability_listing_id_inventory_date ON availability (listing_id, inventory_date);
CREATE INDEX availability_market_inventory_date ON availability (market, inventory_date);

CREATE TABLE amenities (
  id                  SERIAL UNIQUE NOT NULL PRIMARY KEY,
  name                VARCHAR(40)
);

CREATE TABLE listing_amenities (
  listing_id          INT NOT NULL REFERENCES listings(id),
  amenity_id          INT NOT NULL REFERENCES amenities(id)
);
