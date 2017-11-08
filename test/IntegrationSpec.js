const { expect } = require('chai');
const sinon = require('sinon');
const { testDbConnection } = require('./inventoryDb/config');
const Inventory = require('../inventoryLocalStore/index');
const SQS = require('../messageBus/amazonSQS');

const testInventoryStore = new Inventory(testDbConnection);
const service = require('../server/httpSearch')(testInventoryStore);
const request = require('supertest');

const {
  TEST_MARKET, TEST_MARKET_URI_ENCODED, NO_LISTINGS_MARKET, NUM_TOTAL_LISTINGS,
  SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_CHECKOUT, NUM_SINGLE_AVAILABILITY_LISTINGS,
  NO_AVAILABILITY_DATE, NO_AVAILABILITY_CHECKOUT,
  AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_CHECKOUT,
  AVAILABLE_DATE_RANGE_LENGTH, NUM_RANGE_AVAILABLE_LISTINGS,
} = require('./fixtures');

const PORT = 4569;
const TEST_USER_ID = '0000000';

describe('Integration Spec', () => {
  let server;
  let sqsStub;

  beforeEach(() => {
    server = service.listen(PORT);
    sqsStub = sinon.stub(SQS, 'publish');
  });

  afterEach(() => {
    server.close();
    sqsStub.restore();
  });

  describe('Search by market', () => {
    it(`Should retrieve all listings matching '${TEST_MARKET}'`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(NUM_TOTAL_LISTINGS);
          const nonMatchListings = response.body.filter(listing => listing.market !== TEST_MARKET);
          expect(nonMatchListings.length).to.equal(0);
        })
        .end(done);
    });

    it(`Should retrieve 0 listings matching '${NO_LISTINGS_MARKET}'`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${NO_LISTINGS_MARKET}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(0);
        })
        .end(done);
    });

    it(`Should retrieve top 2 listings matching '${TEST_MARKET}'`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/2`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(2);
        })
        .end(done);
    });

    it(`Should retrieve all ${NUM_TOTAL_LISTINGS} listings matching '${TEST_MARKET}' when top 100 is requested`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/100`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(NUM_TOTAL_LISTINGS);
        })
        .end(done);
    });
  });

  describe('Search by market and date range', () => {
    it(`Should retrieve all ${TEST_MARKET} listings available for checkin ${SINGLE_AVAILABILITY_DATE} checkout ${SINGLE_AVAILABILITY_CHECKOUT}`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${SINGLE_AVAILABILITY_DATE}/${SINGLE_AVAILABILITY_CHECKOUT}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(NUM_SINGLE_AVAILABILITY_LISTINGS);
          response.body.forEach((listing) => {
            expect(listing.nightlyPrices[0].date).to.equal(SINGLE_AVAILABILITY_DATE);
          });
        })
        .end(done);
    });

    it(`Should retrieve no ${TEST_MARKET} listings available for checkin ${NO_AVAILABILITY_DATE} checkout ${NO_AVAILABILITY_CHECKOUT}`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${NO_AVAILABILITY_DATE}/${NO_AVAILABILITY_CHECKOUT}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(0);
        })
        .end(done);
    });

    it(`Should retrieve all ${TEST_MARKET} listings available for checkin ${AVAILABLE_DATE_RANGE_START} and checkout ${AVAILABLE_DATE_RANGE_CHECKOUT}`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(NUM_RANGE_AVAILABLE_LISTINGS);
          response.body.forEach((listing) => {
            expect(listing.nightlyPrices.length).to.equal(AVAILABLE_DATE_RANGE_LENGTH);
          });
        })
        .end(done);
    });

    it(`Should retrieve 2 of ${NUM_SINGLE_AVAILABILITY_LISTINGS} ${TEST_MARKET} listings available for checkin ${SINGLE_AVAILABILITY_DATE} checkout ${SINGLE_AVAILABILITY_CHECKOUT}`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${SINGLE_AVAILABILITY_DATE}/${SINGLE_AVAILABILITY_CHECKOUT}/2`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(2);
          response.body.forEach((listing) => {
            expect(listing.nightlyPrices.length).to.equal(1);
          });
        })
        .end(done);
    });

    it(`Should retrieve all ${NUM_SINGLE_AVAILABILITY_LISTINGS} ${TEST_MARKET} listings available for checkin ${SINGLE_AVAILABILITY_DATE} checkout ${SINGLE_AVAILABILITY_CHECKOUT} when top 100 is requested`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${SINGLE_AVAILABILITY_DATE}/${SINGLE_AVAILABILITY_CHECKOUT}/100`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(NUM_SINGLE_AVAILABILITY_LISTINGS);
        })
        .end(done);
    });

    it(`Should retrieve 1 of ${NUM_RANGE_AVAILABLE_LISTINGS} ${TEST_MARKET} listings available for checkin ${AVAILABLE_DATE_RANGE_START} checkout ${AVAILABLE_DATE_RANGE_CHECKOUT}`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}/1`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(1);
          response.body.forEach((listing) => {
            expect(listing.nightlyPrices.length).to.equal(AVAILABLE_DATE_RANGE_LENGTH);
          });
        })
        .end(done);
    });

    it(`Should retrieve all ${NUM_RANGE_AVAILABLE_LISTINGS} ${TEST_MARKET} listings available for for checkin ${AVAILABLE_DATE_RANGE_START} checkout ${AVAILABLE_DATE_RANGE_CHECKOUT} when top 100 is requested`, (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}/100`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((response) => {
          expect(response.body.length).to.equal(NUM_RANGE_AVAILABLE_LISTINGS);
          response.body.forEach((listing) => {
            expect(listing.nightlyPrices.length).to.equal(AVAILABLE_DATE_RANGE_LENGTH);
          });
        })
        .end(done);
    });
  });

  describe('Message Bus Publish', () => {
    it('Should publish all search requests with date ranges to the message bus', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}`)
        .expect(() => {
          expect(sqsStub.called).to.equal(true);
        })
        .end(done);
    });

    it('Should publish all dateless search requests to the message bus', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}`)
        .expect(() => {
          expect(sqsStub.called).to.equal(true);
        })
        .end(done);
    });
  });
});
