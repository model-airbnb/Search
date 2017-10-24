// This script tears down all existing database artifacts for the service, sets
// them up from scratch and populates the tables with some seed data.
const { Pool } = require('pg');
const { database, pgConnection, dbConnection } = require('../config');
const { createTableQueries, csvImportQueries, addSeedDataQueries } = require('./setupQueries');

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
  // Create temp tables for CSV imports and import data
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
