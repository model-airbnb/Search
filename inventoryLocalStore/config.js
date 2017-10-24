const config = {
  host: process.env.PGHOST || 'localhost',
  dbuser: process.env.PGUSER || 'search_service',
  database: process.env.SEARCH_INVENTORY_DB || 'inventory',
  password: '',
  port: process.env.PGPORT || 5432,
};

const {
  dbuser, password, host, port, database,
} = config;

const pgConnectionString = `postgresql://${dbuser}:${password}@${host}:${port}/postgres`;
const dbConnectionString = process.env.DATABASE_URL || `postgresql://${dbuser}:${password}@${host}:${port}/${database}`;

module.exports = config;
module.exports.pgConnection = pgConnectionString;
module.exports.dbConnection = dbConnectionString;
