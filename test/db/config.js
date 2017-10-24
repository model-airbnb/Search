const config = {
  host: process.env.PGHOST || 'localhost',
  dbuser: process.env.PGUSER || 'search_service_test',
  database: process.env.SEARCH_INVENTORY_TEST_DB || 'inventory_test',
  password: '',
  port: process.env.PGPORT || 5432,
};

module.exports = config;

const {
  dbuser, password, host, port, database,
} = config;

module.exports.pgConnection = `postgresql://${dbuser}:${password}@${host}:${port}/postgres`;
module.exports.dbConnection = `postgresql://${dbuser}:${password}@${host}:${port}/inventory`;
module.exports.testDbConnection = `postgresql://${dbuser}:${password}@${host}:${port}/${database}`;
