const { expect } = require('chai');
const { testDbConnection } = require('./db/config');
const Inventory = require('../inventoryLocalStore/index');

describe('Inventory Store Spec', () => {
  const db = new Inventory(testDbConnection);

  describe('Listings By Market', () => {
    it('Should retrieve all listings matching "San Francisco"', (done) => {
      db.getListings('San Francisco')
        .then((listings) => {
          const notSFListings = listings.filter(listing => listing.market !== 'San Francisco');
          expect(notSFListings.length).to.equal(0);
          done();
        });
    });

    it('Should retrieve 0 listings matching "Fakecity"', (done) => {
      db.getListings('Fakecity')
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

  describe('Listings By Market and Date Range', () => {
    it('Should retrieve all San Francisco listings available on 2017-11-12', (done) => {
      db.getAvailableListings('San Francisco', '2017-11-12', '2017-11-12')
        .then((results) => {
          const availableListings = results.filter(result => result.inventory_date.toJSON().split('T')[0] === '2017-11-12');
          expect(availableListings.length).to.equal(results.length);
          done();
        });
    });

    it('Should retrieve no San Francisco listings available on 2017-10-02', (done) => {
      db.getAvailableListings('San Francisco', '2017-10-02', '2017-10-02')
        .then((results) => {
          expect(results.length).to.equal(0);
          done();
        });
    });

    it('Should retrieve all San Francisco listings available for all dates in the range 2017-10-19 to 2017-10-23', (done) => {
      const availableListings = new Set();
      const stayDates = {
        '2017-10-19': 0, '2017-10-20': 0, '2017-10-21': 0, '2017-10-22': 0, '2017-10-23': 0,
      };
      db.getAvailableListings('San Francisco', '2017-10-19', '2017-10-23')
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

    it('Should retrieve 2 of 4 San Francisco listings available on 2017-11-12 ', (done) => {
      const availableListings = new Set();
      db.getAvailableListings('San Francisco', '2017-11-12', '2017-11-12', 2)
        .then((results) => {
          results.forEach((result) => {
            availableListings.add(result.listing_id);
          });
          expect(availableListings.size).to.equal(2);
          done();
        });
    });

    it('Should retrieve all 4 San Francisco listings available on 2017-11-12 when top 100 is requested', (done) => {
      db.getAvailableListings('San Francisco', '2017-11-12', '2017-11-12', 100)
        .then((results) => {
          expect(results.length).to.equal(4);
          done();
        });
    });

    it('Should retrieve 1 of 2 San Francisco listings available for all dates in the range 2017-11-10 to 2017-11-12', (done) => {
      const stayDates = { '2017-11-10': 0, '2017-11-11': 0, '2017-11-12': 0 };
      db.getAvailableListings('San Francisco', '2017-11-10', '2017-11-12', 1)
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

    it('Should retrieve all 2 San Francisco listings available for all dates in the range 2017-11-10 to 2017-11-12 when top 100 is requested', (done) => {
      const availableListings = new Set();
      const stayDates = { '2017-11-10': 0, '2017-11-11': 0, '2017-11-12': 0 };
      db.getAvailableListings('San Francisco', '2017-11-10', '2017-11-12', 100)
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
