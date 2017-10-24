const { Pool } = require('pg');

class Inventory {
  constructor(connection) {
    this.pool = new Pool({
      connectionString: connection,
    });
  }

  getListings(market) {
    const queryString = `SELECT * FROM listings WHERE market = '${market}'`;
    return this.pool.query(queryString)
      .then(result => result.rows)
      .catch(console.error);
  }
}


module.exports = Inventory;
