const { expect } = require('chai');
const sinon = require('sinon');
const { testDbConnection } = require('./db/config');
const Inventory = require('../inventoryLocalStore/index');
const SQS = require('../messageBus/amazonSQS');

const testInventoryStore = new Inventory(testDbConnection);
const service = require('../server/httpSearch')(testInventoryStore);
const request = require('supertest');

const PORT = 4569;
const TEST_VISIT_ID = '000';
const TEST_USER_ID = '000000';

describe('Server Spec', () => {
  let server;

  beforeEach(() => {
    server = service.listen(PORT);
  });

  afterEach(() => {
    server.close();
  });

  describe('Search by market', () => {
    it('Should retrieve all listings matching "San Francisco"', (done) => {
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          const notSFListings = response.body.filter(listing => listing.market !== 'San Francisco');
          expect(notSFListings.length).to.equal(0);
        })
        .end(done);
    });

    it('Should retrieve 0 listings matching "Fakecity"', (done) => {
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/Fakecity`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(0);
        })
        .end(done);
    });

    it('Should retrieve top 2 listings matching "San Francisco"', (done) => {
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/2`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(2);
        })
        .end(done);
    });

    it('Should retrieve all 5 listings matching "San Francisco" when top 100 is requested', (done) => {
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/100`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(5);
        })
        .end(done);
    });
  });

  describe('Search by market and date range', () => {
    it('Should retrieve all San Francisco listings available for checkin 2017-11-12 checkout 2017-11-13', (done) => {
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/2017-11-12/2017-11-13`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          const availableListings = response.body.filter(result => result.nightlyPrices[0].date.split('T')[0] === '2017-11-12');
          expect(availableListings.length).to.equal(response.body.length);
          expect(response.body.length).to.equal(4);
        })
        .end(done);
    });

    it('Should retrieve no San Francisco listings available for checkin 2017-10-02 checkout 2017-10-03', (done) => {
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/2017-10-02/2017-10-03`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(0);
        })
        .end(done);
    });

    it('Should retrieve all San Francisco listings available for checkin 2017-10-19 and checkout 2017-10-24', (done) => {
      const availableListings = new Set();
      const stayDates = {
        '2017-10-19': 0, '2017-10-20': 0, '2017-10-21': 0, '2017-10-22': 0, '2017-10-23': 0,
      };
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/2017-10-19/2017-10-24`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          response.body.forEach((result) => {
            availableListings.add(result.listingId);
            expect(result.nightlyPrices.length).to.equal(5);
            result.nightlyPrices.forEach((night) => {
              stayDates[night.date.split('T')[0]] += 1;
            });
          });
          Object.keys(stayDates).forEach((date) => {
            expect(stayDates[date]).to.equal(availableListings.size);
          });
        })
        .end(done);
    });

    it('Should retrieve 2 of 4 San Francisco listings available for checkin 2017-11-12 checkout 2017-11-13', (done) => {
      const availableListings = new Set();
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/2017-11-12/2017-11-13/2`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          response.body.forEach((result) => {
            availableListings.add(result.listingId);
          });
          expect(availableListings.size).to.equal(2);
        })
        .end(done);
    });

    it('Should retrieve all 4 San Francisco listings available for checkin 2017-11-12 checkout 2017-11-13 when top 100 is requested', (done) => {
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/2017-11-12/2017-11-13/100`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(4);
        })
        .end(done);
    });

    it('Should retrieve 1 of 2 San Francisco listings available for checkin 2017-11-10 checkout 2017-11-13', (done) => {
      const stayDates = { '2017-11-10': 0, '2017-11-11': 0, '2017-11-12': 0 };
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/2017-11-10/2017-11-13/1`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          response.body.forEach((result) => {
            result.nightlyPrices.forEach((night) => {
              stayDates[night.date.split('T')[0]] += 1;
            });
          });
          Object.keys(stayDates).forEach((date) => {
            expect(stayDates[date]).to.equal(1);
          });
        })
        .end(done);
    });

    it('Should retrieve all 2 San Francisco listings available for for checkin 2017-11-10 checkout 2017-11-13 when top 100 is requested', (done) => {
      const availableListings = new Set();
      const stayDates = { '2017-11-10': 0, '2017-11-11': 0, '2017-11-12': 0 };
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/2017-11-10/2017-11-13/100`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          response.body.forEach((result) => {
            availableListings.add(result.listingId);
            expect(result.nightlyPrices.length).to.equal(3);
            result.nightlyPrices.forEach((night) => {
              stayDates[night.date.split('T')[0]] += 1;
            });
          });
          Object.keys(stayDates).forEach((date) => {
            expect(availableListings.size).to.equal(2);
            expect(stayDates[date]).to.equal(2);
          });
        })
        .end(done);
    });
  });

  describe('Message Bus Publish', () => {
    let sqsStub;

    beforeEach(() => {
      sqsStub = sinon.stub(SQS, 'publish');
    });

    afterEach(() => {
      sqsStub.restore();
    });

    it('Should publish all search requests with date ranges to the message bus', (done) => {
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco/2017-11-10/2017-11-13`)
        .expect(() => {
          expect(sqsStub.called).to.equal(true);
        })
        .end(done);
    });

    it('Should publish all dateless search requests to the message bus', (done) => {
      request(server)
        .get(`/search/${TEST_VISIT_ID}/${TEST_USER_ID}/San%20Francisco`)
        .expect(() => {
          expect(sqsStub.called).to.equal(true);
        })
        .end(done);
    });
  });
});
