const config = {
  host: process.env.PGHOST || 'localhost',
  dbuser: process.env.PGUSER || 'search_service',
  database: process.env.SEARCH_INVENTORY_DB || 'inventory',
  password: '',
  port: process.env.PGPORT || 5432,
};

module.exports = config;

const {
  dbuser, password, host, port, database,
} = config;

module.exports.pgConnection = `postgresql://${dbuser}:${password}@${host}:${port}/postgres`;
module.exports.dbConnection = process.env.DATABASE_URL || `postgresql://${dbuser}:${password}@${host}:${port}/${database}`;
