const { expect } = require('chai');
const { testDbConnection } = require('./db/config');
const Inventory = require('../inventoryLocalStore/index');

describe('Inventory Store Spec', () => {
  const db = new Inventory(testDbConnection);

  describe('Listings', () => {
    it('Should retrieve all listings matching "San Francisco"', (done) => {
      db.getListings('San Francisco')
        .then((listings) => {
          const notSFListings = listings.filter(listing => listing.market !== 'San Francisco');
          expect(notSFListings.length).to.equal(0);
          done();
        });
    });

    it('Should retrieve 0 listings matching "Notindb"', (done) => {
      db.getListings('Notindb')
        .then((listings) => {
          expect(listings.length).to.equal(0);
          done();
        });
    });

    it('Should retrieve top 2 listings matching "San Francisco"', (done) => {
      db.getListings('San Francisco', 2)
        .then((listings) => {
          const SFListings = listings.filter(listing => listing.market === 'San Francisco');
          expect(SFListings.length).to.equal(2);
          done();
        });
    });

    it('Should retrieve all 5 listings matching "San Francisco" when top 100 is requested', (done) => {
      db.getListings('San Francisco', 100)
        .then((listings) => {
          const SFListings = listings.filter(listing => listing.market === 'San Francisco');
          expect(SFListings.length).to.equal(5);
          done();
        });
    });
  });
});
