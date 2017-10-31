const { expect } = require('chai');
const { testDbConnection } = require('./db/config');
const Inventory = require('../inventoryLocalStore/index');

const {
  MARKET, NUM_TOTAL_LISTINGS, SINGLE_AVAILABILITY_DATE, NUM_SINGLE_AVAILABILITY_LISTINGS,
  LIMIT, NO_AVAILABILITY_DATE, NO_LISTINGS_MARKET,
} = require('./fixtures');

describe('Inventory Store Spec', () => {
  const db = new Inventory(testDbConnection);

  describe('Listings By Market', () => {
    it(`Should retrieve all listings matching "${MARKET}"`, (done) => {
      db.getListings(MARKET)
        .then((listings) => {
          expect(listings.length).to.equal(NUM_TOTAL_LISTINGS);
          const notSFListings = listings.filter(listing => listing.market !== MARKET);
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

    it(`Should retrieve ${LIMIT} of ${NUM_TOTAL_LISTINGS} listings matching "${MARKET}"`, (done) => {
      db.getListings(MARKET, LIMIT)
        .then((listings) => {
          const SFListings = listings.filter(listing => listing.market === MARKET);
          expect(SFListings.length).to.equal(LIMIT);
          done();
        });
    });

    it(`Should retrieve all ${NUM_TOTAL_LISTINGS} listings matching "${MARKET}" when top 100 is requested`, (done) => {
      db.getListings(MARKET, 100)
        .then((listings) => {
          const SFListings = listings.filter(listing => listing.market === MARKET);
          expect(SFListings.length).to.equal(NUM_TOTAL_LISTINGS);
          done();
        });
    });
  });

  describe('Listings By Market and Date Range', () => {
    it(`Should retrieve all ${MARKET} listings available on ${SINGLE_AVAILABILITY_DATE}`, (done) => {
      db.getAvailableListings(MARKET, SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_DATE)
        .then((results) => {
          const availableListings = results.filter(result =>
            result.inventory_date.toJSON().split('T')[0] === SINGLE_AVAILABILITY_DATE);
          expect(availableListings.length).to.equal(results.length);
          done();
        });
    });

    it(`Should retrieve no ${MARKET} listings available on ${NO_AVAILABILITY_DATE}`, (done) => {
      db.getAvailableListings(MARKET, NO_AVAILABILITY_DATE, NO_AVAILABILITY_DATE)
        .then((results) => {
          expect(results.length).to.equal(0);
          done();
        });
    });

    it(`Should retrieve all ${MARKET} listings available for all dates in the range 2017-10-19 to 2017-10-23`, (done) => {
      const availableListings = new Set();
      const stayDates = {
        '2017-10-19': 0, '2017-10-20': 0, '2017-10-21': 0, '2017-10-22': 0, '2017-10-23': 0,
      };
      db.getAvailableListings(MARKET, '2017-10-19', '2017-10-23')
        .then((results) => {
          results.forEach((result) => {
            availableListings.add(result.listing_id);
            stayDates[result.inventory_date.toJSON().split('T')[0]] += 1;
          });
          Object.keys(stayDates).forEach((date) => {
            expect(stayDates[date]).to.equal(availableListings.size);
          });
          done();
        });
    });

    it(`Should retrieve ${LIMIT} of ${NUM_SINGLE_AVAILABILITY_LISTINGS} ${MARKET} listings available on ${SINGLE_AVAILABILITY_DATE}`, (done) => {
      const availableListings = new Set();
      db.getAvailableListings(MARKET, SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_DATE, LIMIT)
        .then((results) => {
          results.forEach((result) => {
            availableListings.add(result.listing_id);
          });
          expect(availableListings.size).to.equal(LIMIT);
          done();
        });
    });

    it(`Should retrieve all ${NUM_SINGLE_AVAILABILITY_LISTINGS} ${MARKET} listings available on ${SINGLE_AVAILABILITY_DATE} when top 100 is requested`, (done) => {
      db.getAvailableListings(MARKET, SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_DATE, 100)
        .then((results) => {
          expect(results.length).to.equal(4);
          done();
        });
    });

    it(`Should retrieve 1 of 2 ${MARKET} listings available for all dates in the range 2017-11-10 to 2017-11-12`, (done) => {
      const stayDates = { '2017-11-10': 0, '2017-11-11': 0, '2017-11-12': 0 };
      db.getAvailableListings(MARKET, '2017-11-10', '2017-11-12', 1)
        .then((results) => {
          results.forEach((result) => {
            stayDates[result.inventory_date.toJSON().split('T')[0]] += 1;
          });
          Object.keys(stayDates).forEach((date) => {
            expect(stayDates[date]).to.equal(1);
          });
          done();
        });
    });

    it(`Should retrieve all 2 ${MARKET} listings available for all dates in the range 2017-11-10 to 2017-11-12 when top 100 is requested`, (done) => {
      const availableListings = new Set();
      const stayDates = { '2017-11-10': 0, '2017-11-11': 0, '2017-11-12': 0 };
      db.getAvailableListings(MARKET, '2017-11-10', '2017-11-12', 100)
        .then((results) => {
          results.forEach((result) => {
            availableListings.add(result.listing_id);
            stayDates[result.inventory_date.toJSON().split('T')[0]] += 1;
          });
          Object.keys(stayDates).forEach((date) => {
            expect(availableListings.size).to.equal(2);
            expect(stayDates[date]).to.equal(2);
          });
          done();
        });
    });
  });
});
