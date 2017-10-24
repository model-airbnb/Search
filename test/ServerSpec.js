const { expect } = require('chai');
const { testDbConnection } = require('./db/config');
const Inventory = require('../inventoryLocalStore/index');

const testInventoryStore = new Inventory(testDbConnection);
const service = require('../server/httpSearch')(testInventoryStore);
const request = require('supertest');

const PORT = 4569;

describe('Server Spec', () => {
  let server;

  beforeEach(() => {
    server = service.listen(PORT);
  });

  afterEach(() => {
    server.close();
  });

  describe('/search', () => {
    it('Should retrieve all listings matching "San Francisco"', (done) => {
      request(server)
        .get('/search/San%20Francisco')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          const notSFListings = response.body.filter(listing => listing.market !== 'San Francisco');
          expect(notSFListings.length).to.equal(0);
        })
        .end(done);
    });

    it('Should retrieve 0 listings matching "Notindb"', (done) => {
      request(server)
        .get('/search/Notindb')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(0);
        })
        .end(done);
    });

    it('Should retrieve top 2 listings matching "San Francisco"', (done) => {
      request(server)
        .get('/search/San%20Francisco/2')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(2);
        })
        .end(done);
    });

    it('Should retrieve all 5 listings matching "San Francisco" when top 100 is requested', (done) => {
      request(server)
        .get('/search/San%20Francisco/100')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(5);
        })
        .end(done);
    });
  });
});
