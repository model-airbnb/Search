const { expect } = require('chai');
const sinon = require('sinon');
const { testDbConnection } = require('./inventoryDb/config');
const helpers = require('../server/helpers');
const Inventory = require('../inventoryLocalStore/index');
// const recommendationStore = require('../recommendationStore/model');
const messageBus = require('../messageBus/index');

const testInventoryStore = new Inventory(testDbConnection);
const service = require('../server/httpSearch')(testInventoryStore);
const request = require('supertest');

const {
  TEST_MARKET, TEST_MARKET_URI_ENCODED, NUM_TOTAL_LISTINGS,
  SINGLE_AVAILABILITY_DATE, SINGLE_AVAILABILITY_CHECKOUT, NUM_SINGLE_AVAILABILITY_LISTINGS,
  AVAILABLE_DATE_RANGE_START, AVAILABLE_DATE_RANGE_END, AVAILABLE_DATE_RANGE_CHECKOUT,
  AVAILABLE_DATE_RANGE_LENGTH, NUM_RANGE_AVAILABLE_LISTINGS,
} = require('./fixtures');

const PORT = 4569;
const TEST_USER_ID = '0000000';
const LIMIT = '10';

describe('Server Spec', () => {
  let server;
  let getAvailableListingsStub;
  let sortListingsStub;
  let publishSearchEventStub;

  beforeEach(() => {
    server = service.listen(PORT);
    getAvailableListingsStub = sinon.stub(testInventoryStore, 'getAvailableListings').returns(Promise.resolve([]));
    sortListingsStub = sinon.stub(helpers, 'sortListings').returns([]);
    publishSearchEventStub = sinon.stub(messageBus, 'publishSearchEvent');
  });

  afterEach(() => {
    server.close();
    getAvailableListingsStub.restore();
    sortListingsStub.restore();
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
  });
});
