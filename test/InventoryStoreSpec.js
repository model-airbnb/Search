const { expect } = require('chai');
const { testDbConnection } = require('./inventoryDb/config');
const Inventory = require('../inventoryLocalStore/index');

const {
  TEST_MARKET, NO_LISTINGS_MARKET, NUM_TOTAL_LISTINGS,
  SINGLE_AVAILABILITY_DATE, NO_AVAILABILITY_DATE, NUM_SINGLE_AVAILABILITY_LISTINGS,
  AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_END,
  AVAILABLE_DATE_RANGE_LENGTH, NUM_RANGE_AVAILABLE_LISTINGS,
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
});
