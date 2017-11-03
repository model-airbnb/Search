const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  dbuser: process.env.POSTGRES_USER || 'search_service',
  database: process.env.POSTGRES_DB || 'inventory',
  port: process.env.POSTGRES_PORT || 5432,
};

module.exports = config;

const {
  dbuser, password, host, port, database,
} = config;

module.exports.pgConnection = `postgresql://${dbuser}:${password}@${host}:${port}/postgres`;
module.exports.dbConnection = process.env.DATABASE_URL || `postgresql://${dbuser}:${password}@${host}:${port}/${database}`;
