const { expect } = require('chai');
const { testDbConnection } = require('./db/config');
const Inventory = require('../inventoryLocalStore/index');

describe('Inventory Store Spec', () => {
  describe('Listings', () => {
    it('Should retrieve all listings matching "San Francisco"', (done) => {
      const db = new Inventory(testDbConnection);
      db.getListings('San Francisco')
        .then((listings) => {
          const notSFListings = listings.filter(listing => listing.market !== 'San Francisco');
          expect(notSFListings.length).to.equal(0);
          done();
        });
    });
  });
});
