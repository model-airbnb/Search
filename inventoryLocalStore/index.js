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

  addOrUpdateListing(listing) {
    const {
      listingName, hostName, market, neighbourhood, roomType, averageRating,
    } = listing;
    const listingId = listing.listings_id;
    const queryString = `
        INSERT INTO listings (id, name, host_name, market, neighbourhood, room_type, average_rating)
          VALUES (${listingId}, '${listingName}', '${hostName}', '${market}', '${neighbourhood}', '${roomType}', ${averageRating})
          ON CONFLICT (id) DO UPDATE SET
            name = '${listingName}',
            host_name = '${hostName}',
            market = '${market}',
            neighbourhood = '${neighbourhood}',
            room_type = '${roomType}',
            average_rating = ${averageRating}
            WHERE listings.id = ${listingId}
          RETURNING id;
    `;
    return this.pool.query(queryString)
      .catch(console.error);
  }

  deleteListing(listingId) {
    const queryString = `DELETE FROM listings WHERE id = ${listingId};`;
    return this.pool.query(queryString)
      .catch(console.error);
  }

  addOrUpdateAvailability(availability) {
    const { listingId, inventoryDate, price } = availability;
    return this.pool.query(`SELECT id FROM listings WHERE id = ${listingId}`)
      .then((result) => {
        const queryString = `
            INSERT INTO availability (listing_id, market, inventory_date, price)
              VALUES (${listingId}, (SELECT market from listings WHERE id = ${listingId}), '${inventoryDate}'::timestamp, '${price}'::money)
              ON CONFLICT (listing_id, inventory_date) DO UPDATE SET
                market = (SELECT market from listings WHERE id = ${listingId}),
                price = '${price}'::money
                WHERE availability.listing_id = ${listingId} AND availability.inventory_date = '${inventoryDate}'::timestamp
              RETURNING listing_id, inventory_date;
        `;
        return result.rows.length === 0 ? Promise.resolve(null) :
          this.pool.query(queryString)
            .catch(console.error);
      });
  }

  deleteAvailability(availability) {
    const { listingId, inventoryDate } = availability;
    const queryString = `DELETE FROM availability WHERE listing_id = ${listingId} AND inventory_date = '${inventoryDate}'::timestamp;`;
    return this.pool.query(queryString)
      .catch(console.error);
  }
}

module.exports = Inventory;
