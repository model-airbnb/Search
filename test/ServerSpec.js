const { expect } = require('chai');
const sinon = require('sinon');
const { testDbConnection } = require('./inventoryDb/config');
const Inventory = require('../inventoryLocalStore/index');
const messageBus = require('../messageBus/index');

const testInventoryStore = new Inventory(testDbConnection);
const service = require('../server/httpSearch')(testInventoryStore);
const request = require('supertest');

const {
  TEST_MARKET, TEST_MARKET_URI_ENCODED, stubListings, stubResults,
  SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_CHECKOUT,
  AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_END, AVAILABLE_DATE_RANGE_CHECKOUT,
} = require('./fixtures');

const { HTTP_REQUEST, FETCH_LISTINGS } = require('../server/helpers');

const PORT = 4569;
const TEST_USER_ID = '0000000';
const LIMIT = '10';

describe('Server Spec', () => {
  let server;
  let getAvailableListingsStub;
  let publishSearchEventStub;

  beforeEach(() => {
    server = service.listen(PORT);
    getAvailableListingsStub = sinon.stub(testInventoryStore, 'getAvailableListings').returns(Promise.resolve(stubListings));
    publishSearchEventStub = sinon.stub(messageBus, 'publishSearchEvent');
  });

  afterEach(() => {
    server.close();
    getAvailableListingsStub.restore();
    publishSearchEventStub.restore();
  });

  describe('Inventory Store Interface', () => {
    it('Should retrieve listings using the correct parameters for a one night stay (no limit)', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${SINGLE_AVAILABILITY_DATE}/${SINGLE_AVAILABILITY_CHECKOUT}`)
        .expect(() => {
          expect(getAvailableListingsStub.calledWithExactly(TEST_MARKET, SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_DATE, undefined)).to.be.true;
        })
        .end(done);
    });

    it('Should retrieve listings using the correct parameters for a one night stay (with limit)', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${SINGLE_AVAILABILITY_DATE}/${SINGLE_AVAILABILITY_CHECKOUT}/${LIMIT}`)
        .expect(() => {
          expect(getAvailableListingsStub.calledWithExactly(TEST_MARKET, SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_DATE, LIMIT)).to.be.true;
        })
        .end(done);
    });

    it('Should retrieve listings using the correct parameters for a multi-night stay (no limit)', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(() => {
          expect(getAvailableListingsStub.calledWithExactly(TEST_MARKET, AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_END, undefined)).to.be.true;
        })
        .end(done);
    });

    it('Should retrieve listings using the correct parameters for a multi-night stay (with limit)', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}/${LIMIT}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(() => {
          expect(getAvailableListingsStub.calledWithExactly(TEST_MARKET, AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_END, LIMIT)).to.be.true;
        })
        .end(done);
    });
  });

  describe('Message Bus Interface', () => {
    it('Should publish to the message bus after handling a search request', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}/${LIMIT}`)
        .expect(() => {
          expect(publishSearchEventStub.calledAfter(getAvailableListingsStub)).to.be.true;
        })
        .end(done);
    });

    it('Should provide a search event id when publishing to the message bus', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}/${LIMIT}`)
        .expect(() => {
          expect(publishSearchEventStub.args[0][0]).to.be.a('string');
        })
        .end(done);
    });

    it('Should include the search request parameters when publishing to the message bus', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}/${LIMIT}`)
        .expect(() => {
          const {
            market, checkIn, checkOut, limit,
          } = publishSearchEventStub.args[0][1];
          expect(market).to.equal(TEST_MARKET);
          expect(checkIn).to.equal(AVAILABLE_DATE_RANGE_START);
          expect(checkOut).to.equal(AVAILABLE_DATE_RANGE_CHECKOUT);
          expect(limit).to.equal(LIMIT);
        })
        .end(done);
    });

    it('Should include the search results when publishing to the message bus', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}/${LIMIT}`)
        .expect(() => {
          expect(publishSearchEventStub.args[0][2]).to.deep.equal(stubResults);
        })
        .end(done);
    });

    it('Should include the operations log when publishing to the message bus', (done) => {
      request(server)
        .get(`/search/${TEST_USER_ID}/${TEST_MARKET_URI_ENCODED}/${AVAILABLE_DATE_RANGE_START}/${AVAILABLE_DATE_RANGE_CHECKOUT}/${LIMIT}`)
        .expect(() => {
          expect(publishSearchEventStub.args[0][3]).to.have.ownPropertyDescriptor(HTTP_REQUEST);
          expect(publishSearchEventStub.args[0][3]).to.have.ownPropertyDescriptor(FETCH_LISTINGS);
        })
        .end(done);
    });
  });
});
