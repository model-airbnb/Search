const { Pool } = require('pg');

const MS_IN_A_DAY = 1000 * 60 * 60 * 24;

const getLengthOfStay = (firstNight, lastNight) =>
  ((new Date(lastNight) - new Date(firstNight)) / MS_IN_A_DAY) + 1;

class Inventory {
  constructor(connection) {
    this.pool = new Pool({ connectionString: connection });
  }

  getListings(market, limit) {
    const queryLimit = limit ? ` FETCH FIRST ${limit} ROWS ONLY` : '';
    const queryString = `SELECT * FROM listings WHERE market = '${market}'${queryLimit}`;
    return this.pool.query(queryString)
      .then(result => result.rows)
      .catch(console.error);
  }

  getAvailableListings(market, firstNight, lastNight, limit) {
    const queryLimit = limit ? ` FETCH FIRST ${limit * getLengthOfStay(firstNight, lastNight)} ROWS ONLY` : '';
    const queryString = `
      SELECT DISTINCT *
      FROM listings AS l
      INNER JOIN availability AS a ON l.id = a.listing_id
      INNER JOIN (
        SELECT  listing_id,
                count(listing_id) num_nights
        FROM availability
        WHERE inventory_date BETWEEN '${firstNight}'::timestamp AND '${lastNight}'::timestamp
        GROUP BY listing_id
      ) AS s ON l.id = s.listing_id
      WHERE num_nights = (SELECT DATE_PART('day', '${lastNight}'::timestamp - '${firstNight}'::timestamp) + 1)
        AND inventory_date BETWEEN '${firstNight}'::timestamp AND '${lastNight}'::timestamp
        AND l.market = '${market}'
        ${queryLimit}
    `;
    return this.pool.query(queryString)
      .then(result => result.rows)
      .catch(console.error);
  }
}

module.exports = Inventory;
