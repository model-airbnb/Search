const { expect } = require('chai');
const { testDbConnection } = require('./inventoryDb/config');
const Inventory = require('../inventoryLocalStore/index');

const {
  TEST_MARKET, NO_LISTINGS_MARKET, NUM_TOTAL_LISTINGS,
  SINGLE_AVAILABILITY_DATE, NO_AVAILABILITY_DATE, NUM_SINGLE_AVAILABILITY_LISTINGS,
  AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_END,
  AVAILABLE_DATE_RANGE_LENGTH, NUM_RANGE_AVAILABLE_LISTINGS,
  newListing, newAvailability,
} = require('./fixtures');

describe('Inventory Store Spec', () => {
  const db = new Inventory(testDbConnection);

  describe('Listings By Market', () => {
    it(`Should retrieve all listings matching "${TEST_MARKET}"`, (done) => {
      db.getListings(TEST_MARKET)
        .then((listings) => {
          expect(listings.length).to.equal(NUM_TOTAL_LISTINGS);
          const notSFListings = listings.filter(listing => listing.market !== TEST_MARKET);
          expect(notSFListings.length).to.equal(0);
          done();
        });
    });

    it(`Should retrieve 0 listings matching "${NO_LISTINGS_MARKET}"`, (done) => {
      db.getListings(NO_LISTINGS_MARKET)
        .then((listings) => {
          expect(listings.length).to.equal(0);
          done();
        });
    });

    it(`Should retrieve 2 of ${NUM_TOTAL_LISTINGS} listings matching "${TEST_MARKET}"`, (done) => {
      db.getListings(TEST_MARKET, 2)
        .then((listings) => {
          const SFListings = listings.filter(listing => listing.market === TEST_MARKET);
          expect(SFListings.length).to.equal(2);
          done();
        });
    });

    it(`Should retrieve all ${NUM_TOTAL_LISTINGS} listings matching "${TEST_MARKET}" when top 100 is requested`, (done) => {
      db.getListings(TEST_MARKET, 100)
        .then((listings) => {
          const SFListings = listings.filter(listing => listing.market === TEST_MARKET);
          expect(SFListings.length).to.equal(NUM_TOTAL_LISTINGS);
          done();
        });
    });
  });

  describe('Listings By Market and Date Range', () => {
    it(`Should retrieve all ${TEST_MARKET} listings available on ${SINGLE_AVAILABILITY_DATE}`, (done) => {
      db.getAvailableListings(TEST_MARKET, SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_DATE)
        .then((results) => {
          const availableListings = results.filter(result =>
            result.dates[0].toJSON().split('T')[0] === SINGLE_AVAILABILITY_DATE);
          expect(availableListings.length).to.equal(results.length);
          done();
        });
    });

    it(`Should retrieve no ${TEST_MARKET} listings available on ${NO_AVAILABILITY_DATE}`, (done) => {
      db.getAvailableListings(TEST_MARKET, NO_AVAILABILITY_DATE, NO_AVAILABILITY_DATE)
        .then((results) => {
          expect(results.length).to.equal(0);
          done();
        });
    });

    it(`Should retrieve all ${TEST_MARKET} listings available for all dates in the range ${AVAILABLE_DATE_RANGE_START} to ${AVAILABLE_DATE_RANGE_END}`, (done) => {
      db.getAvailableListings(TEST_MARKET, AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_END)
        .then((results) => {
          results.forEach((result) => {
            expect(result.dates.length).to.equal(AVAILABLE_DATE_RANGE_LENGTH);
          });
          expect(results.length).to.equal(NUM_RANGE_AVAILABLE_LISTINGS);
          done();
        });
    });

    it(`Should retrieve 2 of ${NUM_SINGLE_AVAILABILITY_LISTINGS} ${TEST_MARKET} listings available on ${SINGLE_AVAILABILITY_DATE}`, (done) => {
      db.getAvailableListings(TEST_MARKET, SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_DATE, 2)
        .then((results) => {
          expect(results.length).to.equal(2);
          done();
        });
    });

    it(`Should retrieve all ${NUM_SINGLE_AVAILABILITY_LISTINGS} ${TEST_MARKET} listings available on ${SINGLE_AVAILABILITY_DATE} when top 100 is requested`, (done) => {
      db.getAvailableListings(TEST_MARKET, SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_DATE, 100)
        .then((results) => {
          expect(results.length).to.equal(4);
          done();
        });
    });

    it(`Should retrieve 1 of ${NUM_RANGE_AVAILABLE_LISTINGS} ${TEST_MARKET} listings available for all dates in the range ${AVAILABLE_DATE_RANGE_START} to ${AVAILABLE_DATE_RANGE_END}`, (done) => {
      db.getAvailableListings(TEST_MARKET, AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_END, 1)
        .then((results) => {
          expect(results[0].dates.length).to.equal(AVAILABLE_DATE_RANGE_LENGTH);
          expect(results.length).to.equal(1);
          done();
        });
    });

    it(`Should retrieve all ${NUM_RANGE_AVAILABLE_LISTINGS} ${TEST_MARKET} listings available for all dates in the range ${AVAILABLE_DATE_RANGE_START} to ${AVAILABLE_DATE_RANGE_END} when top 100 is requested`, (done) => {
      db.getAvailableListings(TEST_MARKET, AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_END, 100)
        .then((results) => {
          results.forEach((result) => {
            expect(result.dates.length).to.equal(AVAILABLE_DATE_RANGE_LENGTH);
          });
          done();
        });
    });
  });

  describe('Listings Updates', () => {
    it('Should add a new listing to the database if it does not already exist', (done) => {
      db.addOrUpdateListing(newListing)
        .then((result) => {
          expect(result.rowCount).to.equal(1);
          expect(result.rows[0].id).to.equal(newListing.listings_id);
          return db.getListings(newListing.market);
        })
        .then((results) => {
          expect(results.length).to.equal(NUM_TOTAL_LISTINGS + 1);
          return db.deleteListing(newListing.listings_id);
        })
        .then(() => {
          done();
        });
    });

    it('Should update an existing listing in the database', (done) => {
      const updatedListing = Object.assign(newListing);
      updatedListing.averageRating = newListing.averageRating - 5;
      db.addOrUpdateListing(newListing)
        .then(() => db.addOrUpdateListing(updatedListing))
        .then((result) => {
          expect(result.rowCount).to.equal(1);
          expect(result.rows[0].id).to.equal(newListing.listings_id);
          return db.getListings(newListing.market);
        })
        .then((results) => {
          expect(results.length).to.equal(NUM_TOTAL_LISTINGS + 1);
          return db.deleteListing(newListing.listings_id);
        })
        .then(() => {
          done();
        });
    });

    it('Should delete a listing if it exists in the database', (done) => {
      db.addOrUpdateListing(newListing)
        .then(() => db.deleteListing(newListing.listings_id))
        .then((result) => {
          expect(result.rowCount).to.equal(1);
          return db.getListings(newListing.market);
        })
        .then((results) => {
          expect(results.length).to.equal(NUM_TOTAL_LISTINGS);
          return db.deleteListing(newListing.listings_id);
        })
        .then((result) => {
          expect(result.rowCount).to.equal(0);
          done();
        });
    });
  });

  describe('Availability Updates', () => {
    it('Should add availability for an existing listing', (done) => {
      db.addOrUpdateAvailability(newAvailability)
        .then((result) => {
          expect(result.rowCount).to.equal(1);
          expect(result.rows[0].listing_id).to.equal(newAvailability.listingId);
          expect(result.rows[0].inventory_date.toISOString().split('T')[0]).to.equal(newAvailability.inventoryDate);

          const { inventoryDate } = newAvailability;
          return db.getAvailableListings(TEST_MARKET, inventoryDate, inventoryDate);
        })
        .then((results) => {
          expect(results.length).to.equal(1);
          const availableListing = results[0];
          expect(availableListing.id).to.equal(newAvailability.listingId);
          expect(availableListing.dates[0].toISOString().split('T')[0]).to.equal(newAvailability.inventoryDate);
          expect(availableListing.market).to.equal(TEST_MARKET);
          expect(availableListing.prices[0]).to.equal(newAvailability.price);
          return db.deleteAvailability(newAvailability);
        })
        .then(() => {
          done();
        });
    });

    it('Should update availability for an existing listing', (done) => {
      const { inventoryDate } = newAvailability;
      const updatedAvailability = Object.assign(newAvailability);
      updatedAvailability.price = '$88.00';
      db.addOrUpdateAvailability(newAvailability)
        .then(() => db.addOrUpdateAvailability(updatedAvailability))
        .then((result) => {
          expect(result.rowCount).to.equal(1);
          expect(result.rows[0].listing_id).to.equal(newAvailability.listingId);
          expect(result.rows[0].inventory_date.toISOString().split('T')[0]).to.equal(newAvailability.inventoryDate);
          return db.getAvailableListings(TEST_MARKET, inventoryDate, inventoryDate);
        })
        .then((results) => {
          expect(results.length).to.equal(1);
          const availableListing = results[0];
          expect(availableListing.id).to.equal(newAvailability.listingId);
          expect(availableListing.dates[0].toISOString().split('T')[0]).to.equal(newAvailability.inventoryDate);
          expect(availableListing.market).to.equal(TEST_MARKET);
          expect(availableListing.prices[0]).to.equal(updatedAvailability.price);
          return db.deleteAvailability(updatedAvailability);
        })
        .then(() => {
          done();
        });
    });

    it('Should delete availability for an existing listing', (done) => {
      const { inventoryDate } = newAvailability;
      db.addOrUpdateAvailability(newAvailability)
        .then(() => db.deleteAvailability(newAvailability))
        .then((result) => {
          expect(result.rowCount).to.equal(1);
          return db.getAvailableListings(TEST_MARKET, inventoryDate, inventoryDate);
        })
        .then((results) => {
          expect(results.length).to.equal(0);
          return db.deleteAvailability(newAvailability);
        })
        .then((result) => {
          expect(result.rowCount).to.equal(0);
          done();
        });
    });

    it('Should not add availability for a listing not in the listings table', (done) => {
      const invalidAvailability = Object.assign(newAvailability);
      invalidAvailability.listingId = 0;
      const { inventoryDate } = invalidAvailability;
      db.addOrUpdateAvailability(invalidAvailability)
        .then((result) => {
          expect(result).to.be.null;
          return db.getAvailableListings(TEST_MARKET, inventoryDate, inventoryDate);
        })
        .then((results) => {
          expect(results.length).to.equal(0);
        })
        .then(() => {
          done();
        });
    });
  });
});
