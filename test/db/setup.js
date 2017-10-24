// This script tears down all existing test database artifacts for the service,
// sets them up from scratch and populates the tables with a small test data set.

const { Pool } = require('pg');
const {
  database, pgConnection, dbConnection, testDbConnection,
} = require('./config');
const { createTableQueries, csvExportQueries, csvImportQueries } = require('./setupQueries');

// Connect first to the postgres database to manage inventory_test database drop/create
let pool = new Pool({
  connectionString: pgConnection,
});

// Drop the existing inventory_test database and create a new one
pool.query(`DROP DATABASE IF EXISTS ${database}`)
  .then(() => pool.query(`CREATE DATABASE ${database}`))
  .then(() => pool.end())
  .then(() => { // Connect to the inventory database to export data for test db
    pool = new Pool({ connectionString: dbConnection });
    return pool.query(csvExportQueries.listings);
  })
  .then(() => pool.query(csvExportQueries.availability))
  .then(() => pool.end())
  .then(() => { // Connect to the inventory_test db to create tables and import data
    pool = new Pool({ connectionString: testDbConnection });
    return pool.query(createTableQueries.listings);
  })
  .then(() => pool.query(createTableQueries.availability))
  .then(() => pool.query(csvImportQueries.listings))
  .then(() => pool.query(csvImportQueries.availability))
  .then(() => {
    console.log('TEST: All inventory tables created and seeded with data.');
  })
  .catch(console.error)
  .then(() => pool.end());
