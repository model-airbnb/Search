const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  dbuser: process.env.POSTGRES_USER_TEST || 'search_service_test',
  database: process.env.POSTGRES_DB_TEST || 'inventory_test',
  port: process.env.POSTGRES_PORT || 5432,
};

module.exports = config;

const {
  dbuser, password, host, port, database,
} = config;

module.exports.pgConnection = `postgresql://${dbuser}:${password}@${host}:${port}/postgres`;
module.exports.testDbConnection = `postgresql://${dbuser}:${password}@${host}:${port}/${database}`;
