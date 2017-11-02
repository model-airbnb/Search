// This script tears down all existing database artifacts for the service, sets
// them up from scratch and populates the tables with some seed data.
const { Pool } = require('pg');
const { database, pgConnection, dbConnection } = require('../../inventoryLocalStore/config');
const {
  createTable, csvImport, addSeedData, dropTable, createIndex,
} = require('./dbQueries');

const markets = [
  { name: 'San Francisco', filename: 'sf' },
  { name: 'Sydney', filename: 'sydney' },
  { name: 'New York', filename: 'nyc' },
  { name: 'Toronto', filename: 'toronto' },
  { name: 'Paris', filename: 'paris' },
  { name: 'London', filename: 'london' },
  { name: 'Amsterdam', filename: 'amsterdam' },
];

const createTables = pool => (
  pool.query(createTable.listings)
    .then(() => pool.query(createTable.availability))
);

const seedTable = (pool, market) => (
  pool.query(createTable.listingsRawData)
    .then(() => pool.query(createTable.availabilityRawData))
    .then(() => pool.query(csvImport.listings(market)))
    .then(() => pool.query(csvImport.availability(market)))
    .then(() => pool.query(addSeedData.listings(market)))
    .then(() => pool.query(addSeedData.availability))
    .then(() => pool.query(dropTable.listingsRawData))
    .then(() => pool.query(dropTable.availabilityRawData))
    .catch(console.error)
);

// Connect first to the postgres database to manage inventory database drop/create
let pool = new Pool({
  connectionString: pgConnection,
});

// Drop the existing inventory database and create a new one
let async = pool.query(`DROP DATABASE IF EXISTS ${database}`)
  .then(() => pool.query(`CREATE DATABASE ${database}`))
  .then(() => pool.end())
  .then(() => { // Connect to the inventory database to create local inventory store tables
    pool = new Pool({ connectionString: dbConnection });
    return createTables(pool);
  });

for (let i = 0; i < markets.length; i += 1) {
  async = async.then(() => seedTable(pool, markets[i]))
    .then(() => console.log(`Data loaded for ${markets[i].name}`))
    .catch(console.error);
}

async.then(() => pool.query(createIndex.listingsMarket))
  .then(() => pool.query(createIndex.availabilityInventoryDate))
  .then(() => pool.query(createIndex.availabilityListingIdInventoryDate))
  .then(() => {
    console.log('INVENTORY STORE: All tables created and seeded with data.');
  })
  .then(() => pool.end());
