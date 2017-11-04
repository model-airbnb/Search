const { Pool } = require('pg');

const MS_IN_A_DAY = 1000 * 60 * 60 * 24;

const getLengthOfStay = (firstNight, lastNight) =>
  ((new Date(lastNight) - new Date(firstNight)) / MS_IN_A_DAY) + 1;

class Inventory {
  constructor(connection) {
    this.pool = new Pool({ connectionString: connection });
  }

  getListings(market, limit) {
    const queryLimit = limit ? ` LIMIT ${limit}` : '';
    const queryString = `SELECT * FROM listings WHERE market = '${market}'${queryLimit}`;
    return this.pool.query(queryString)
      .then(result => result.rows)
      .catch(console.error);
  }

  getAvailableListings(market, firstNight, lastNight, limit) {
    const queryLimit = limit ? ` LIMIT ${limit}` : '';
    const queryString = `
        SELECT
          l.*,
          array_agg(a.inventory_date) AS dates,
          array_agg(a.price) AS prices
        FROM listings AS l
        INNER JOIN availability AS a ON l.id = a.listing_id
        WHERE inventory_date BETWEEN '${firstNight}'::timestamp AND '${lastNight}'::timestamp
          AND a.market = '${market}'
        GROUP BY l.id
        HAVING count(a.listing_id) = ${getLengthOfStay(firstNight, lastNight)}
        ${queryLimit}
    `;
    return this.pool.query(queryString)
      .then(result => result.rows)
      .catch(console.error);
  }
}

module.exports = Inventory;
