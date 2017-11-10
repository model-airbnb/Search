const { expect } = require('chai');
const sinon = require('sinon');
const messageBus = require('../messageBus/index');
const amazonSQS = require('../messageBus/amazonSQS');

const {
  stubSearchParams, stubResults, stubOperationLog, stubMessages,
} = require('./fixtures');

const STUB_SEARCH_ID = 'searchId';
const STUB_MESSAGE_BUS_QUEUE = 'https://amazon-sqs-url/accountNumber/ModelAirbnb-Search';

describe('Message Bus Spec', () => {
  let sqsPublishStub;
  let sqsPollStub;
  let sqsDoneStub;

  beforeEach(() => {
    sqsPublishStub = sinon.stub(amazonSQS, 'publish');
    sqsPollStub = sinon.stub(amazonSQS, 'poll').returns(Promise.resolve([]));
    sqsDoneStub = sinon.stub(amazonSQS, 'done');
  });

  afterEach(() => {
    sqsPublishStub.restore();
    sqsPollStub.restore();
    sqsDoneStub.restore();
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

  describe('Consume from Message Bus', () => {
    it('Should invoke the poll method on the SQS interface with the queue as an argument', (done) => {
      messageBus.checkForMessages(STUB_MESSAGE_BUS_QUEUE)
        .then(() => {
          expect(sqsPollStub.called).to.be.true;
          expect(sqsPollStub.args[0][0]).to.equal(STUB_MESSAGE_BUS_QUEUE);
          done();
        });
    });

    it('Should return an empty array when there are no messages in the queue', (done) => {
      messageBus.checkForMessages(STUB_MESSAGE_BUS_QUEUE)
        .then((messages) => {
          expect(messages.length).to.equal(0);
          done();
        });
    });

    it('Should not invoke the done method on the SQS interface when there are no messages in the queue', (done) => {
      messageBus.checkForMessages(STUB_MESSAGE_BUS_QUEUE)
        .then((messages) => {
          expect(messages.length).to.equal(0);
          done();
        });
    });

    it('Should return message bodies of messages as JSON objects', (done) => {
      sqsPollStub.returns(Promise.resolve(stubMessages));
      messageBus.checkForMessages(STUB_MESSAGE_BUS_QUEUE)
        .then((messages) => {
          expect(messages.length).to.equal(stubMessages.length);
          expect(messages[0]).to.deep.equal(JSON.parse(stubMessages[0].Body));
          expect(messages[1]).to.deep.equal(JSON.parse(stubMessages[1].Body));
          done();
        });
    });

    it('Should invoke the done method on the SQS interface to delete consumed messages', (done) => {
      sqsPollStub.returns(Promise.resolve(stubMessages));
      messageBus.checkForMessages(STUB_MESSAGE_BUS_QUEUE)
        .then(() => {
          expect(sqsDoneStub.called).to.be.true;
          done();
        });
    });
  });
});
