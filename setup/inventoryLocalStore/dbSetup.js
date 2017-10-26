// This script tears down all existing database artifacts for the service, sets
// them up from scratch and populates the tables with some seed data.
const { Pool } = require('pg');
const { database, pgConnection, dbConnection } = require('../../inventoryLocalStore/config');
const { createTable, csvImport, addSeedData } = require('./dbQueries');

// Connect first to the postgres database to manage inventory database drop/create
let pool = new Pool({
  connectionString: pgConnection,
});

// Drop the existing inventory database and create a new one
pool.query(`DROP DATABASE IF EXISTS ${database}`)
  .then(() => pool.query(`CREATE DATABASE ${database}`))
  .then(() => pool.end())
  .then(() => { // Connect to the inventory database to create local inventory store tables
    pool = new Pool({ connectionString: dbConnection });
    return pool.query(createTable.listings);
  })
  .then(() => pool.query(createTable.availability))
  // Create temp tables for CSV imports and import data
  .then(() => pool.query(createTable.listingsRawData))
  .then(() => pool.query(createTable.availabilityRawData))
  .then(() => pool.query(csvImport.listings))
  .then(() => pool.query(csvImport.availability))
  // Add seed data to inventory store tables
  .then(() => pool.query(addSeedData.listings))
  .then(() => pool.query(addSeedData.availability))
  .then(() => {
    console.log('INVENTORY STORE: All tables created and seeded with data.');
  })
  .catch((err) => {
    console.error(err);
  })
  .then(() => pool.end());
