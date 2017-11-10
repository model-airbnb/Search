const { expect } = require('chai');
const sinon = require('sinon');
const messageBus = require('../messageBus/index');
const SQS = require('../messageBus/amazonSQS');

const { stubSearchParams, stubResults, stubOperationLog } = require('./fixtures');

const STUB_SEARCH_ID = 'searchId';

describe('Message Bus Spec', () => {
  let sqsPublishStub;
  let sqsPollStub;

  beforeEach(() => {
    sqsPublishStub = sinon.stub(SQS, 'publish');
    sqsPollStub = sinon.stub(SQS, 'poll');
  });

  afterEach(() => {
    sqsPublishStub.restore();
    sqsPollStub.restore();
  });

  describe('Publish to Message Bus', () => {
    it('Should invoke the publish method on the SQS interface', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      expect(sqsPublishStub.called).to.be.true;
    });

    it('Should construct the message payload with the correct search id', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      expect(sqsPublishStub.args[0][0].payload).to.have.ownPropertyDescriptor('searchEventId');
      expect(sqsPublishStub.args[0][0].payload.searchEventId).to.equal(STUB_SEARCH_ID);
    });

    it('Should construct the message payload with a timestamp', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      expect(sqsPublishStub.args[0][0].payload.timestamp.indexOf('T')).to.not.equal(-1);
      expect(sqsPublishStub.args[0][0].payload).to.have.ownPropertyDescriptor('timestamp');
    });

    it('Should construct the message payload with a request object containing market and stay dates', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      expect(sqsPublishStub.args[0][0].payload).to.have.ownPropertyDescriptor('request');
      expect(sqsPublishStub.args[0][0].payload.request).to.be.an('object');
      expect(sqsPublishStub.args[0][0].payload.request).to.have.ownPropertyDescriptor('market');
      expect(sqsPublishStub.args[0][0].payload.request).to.have.ownPropertyDescriptor('checkIn');
      expect(sqsPublishStub.args[0][0].payload.request).to.have.ownPropertyDescriptor('checkOut');
    });

    it('Should construct the message payload with a results object containing a list of listings', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      expect(sqsPublishStub.args[0][0].payload).to.have.ownPropertyDescriptor('results');
      expect(sqsPublishStub.args[0][0].payload.results).to.be.an('array');
      expect(sqsPublishStub.args[0][0].payload.results).to.deep.equal(stubResults);
    });

    it('Should construct the message payload with an operations log of time taken for the request and for fetching from the db', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      expect(sqsPublishStub.args[0][0].payload).to.have.ownPropertyDescriptor('timeline');
      expect(sqsPublishStub.args[0][0].payload.timeline).to.be.an('object');
      expect(sqsPublishStub.args[0][0].payload.timeline).to.deep.equal(stubOperationLog);
    });
  });
});
