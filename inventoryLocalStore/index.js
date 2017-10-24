const { Pool } = require('pg');

class Inventory {
  constructor(connection) {
    this.pool = new Pool({
      connectionString: connection,
    });
  }

  getListings(market, limit) {
    const queryLimit = limit ? ` FETCH FIRST ${limit} ROWS ONLY` : '';
    const queryString = `SELECT * FROM listings WHERE market = '${market}'${queryLimit}`;
    return this.pool.query(queryString)
      .then(result => result.rows)
      .catch(console.error);
  }
}

module.exports = Inventory;
