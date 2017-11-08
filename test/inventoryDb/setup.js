// This script tears down all existing test database artifacts for the service,
// sets them up from scratch and populates the tables with a small test data set.

const { Pool } = require('pg');
const { database, pgConnection, testDbConnection } = require('./config');
const { createTable, createIndex } = require('../../inventoryLocalStore/setup/queries');
const {
  LISTINGS_TABLE, listingAttributes, listings,
  AVAILABILITY_TABLE, availabilityAttributes, availability,
} = require('./fixtures');

// Connect first to the postgres database to manage inventory_test database drop/create
let pool = new Pool({
  connectionString: pgConnection,
});

// Drop the existing inventory_test database and create a new one
pool.query(`DROP DATABASE IF EXISTS ${database}`)
  .then(() => pool.query(`CREATE DATABASE ${database}`))
  .then(() => pool.end())
  .then(() => { // Connect to the inventory_test db to create tables and import data
    pool = new Pool({ connectionString: testDbConnection });
    return pool.query(createTable.listings);
  })
  .then(() => pool.query(createTable.availability))
  .then(() => pool.query(createIndex.listingsMarket))
  .then(() => pool.query(createIndex.availabilityInventoryDate))
  .then(() => pool.query(createIndex.availabilityListingIdInventoryDate))
  .then(() => pool.query(createIndex.availabilityMarketInventoryDate))
  .then(() => pool.query(`INSERT INTO ${LISTINGS_TABLE} ${listingAttributes} VALUES ${listings.join(', ')};`))
  .then(() => pool.query(`INSERT INTO ${AVAILABILITY_TABLE} ${availabilityAttributes} VALUES ${availability.join(', ')};`))
  .then(() => {
    console.log('TEST: All inventory tables created and seeded with data.');
  })
  .catch(console.error)
  .then(() => pool.end());
