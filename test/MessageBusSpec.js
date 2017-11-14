const { expect } = require('chai');
const sinon = require('sinon');
const messageBus = require('../messageBus/index');
const amazonSQS = require('../messageBus/amazonSQS');

const {
  TEST_MARKET, stubSearchParams, stubResults, stubOperationLog, stubMessages,
} = require('./fixtures');

const STUB_SEARCH_ID = 'searchId';
const STUB_MESSAGE_BUS_QUEUE = 'https://amazon-sqs-url/accountNumber/ModelAirbnb-Search';

describe('Message Bus Spec', () => {
  describe('Publish to Message Bus', () => {
    let sqsPublishStub;

    beforeEach(() => {
      sqsPublishStub = sinon.stub(amazonSQS, 'publish');
    });

    afterEach(() => {
      sqsPublishStub.restore();
    });

    it('Should invoke the publish method on the SQS interface', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      expect(sqsPublishStub.called).to.be.true;
    });

    it('Should construct the message payload with the correct search id', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      const message = sqsPublishStub.args[0][0];
      expect(message.payload).to.have.ownPropertyDescriptor('searchEventId');
      expect(message.payload.searchEventId).to.equal(STUB_SEARCH_ID);
    });

    it('Should construct the message payload with a timestamp', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      const message = sqsPublishStub.args[0][0];
      expect(message.payload.timestamp.indexOf('T')).to.not.equal(-1);
      expect(message.payload).to.have.ownPropertyDescriptor('timestamp');
    });

    it('Should construct the message payload with a request object containing market and stay dates', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      const message = sqsPublishStub.args[0][0];
      expect(message.payload).to.have.ownPropertyDescriptor('request');
      expect(message.payload.request).to.be.an('object');
      expect(message.payload.request).to.have.ownPropertyDescriptor('market');
      expect(message.payload.request).to.have.ownPropertyDescriptor('checkIn');
      expect(message.payload.request).to.have.ownPropertyDescriptor('checkOut');
    });

    it('Should construct the message payload with a results object containing a list of listings', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      const message = sqsPublishStub.args[0][0];
      expect(message.payload).to.have.ownPropertyDescriptor('results');
      expect(message.payload.results).to.be.an('array');
      expect(message.payload.results).to.deep.equal(stubResults);
    });

    it('Should construct the message payload with an operations log of time taken for the request and for fetching from the db', () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      const message = sqsPublishStub.args[0][0];
      expect(message.payload).to.have.ownPropertyDescriptor('timeline');
      expect(message.payload.timeline).to.be.an('object');
      expect(message.payload.timeline).to.deep.equal(stubOperationLog);
    });

    it(`Should publish message to all subscribers if the searched market is ${TEST_MARKET}`, () => {
      messageBus.publishSearchEvent(STUB_SEARCH_ID, stubSearchParams, stubResults, stubOperationLog);
      expect(sqsPublishStub.args[0][1]).to.equal(true);
    });

    it(`Should publish message only to the Search queue if the searched market is not ${TEST_MARKET}`, () => {
      const searchParams = Object.assign(stubSearchParams);
      searchParams.market = `Not ${TEST_MARKET}`;
      messageBus.publishSearchEvent(STUB_SEARCH_ID, searchParams, stubResults, stubOperationLog);
      expect(sqsPublishStub.args[0][1]).to.equal(false);
    });
  });

  describe('Consume from Message Bus', () => {
    let sqsPollStub;
    let sqsDoneStub;

    beforeEach(() => {
      sqsPollStub = sinon.stub(amazonSQS, 'poll').returns(Promise.resolve([]));
      sqsDoneStub = sinon.stub(amazonSQS, 'done');
    });

    afterEach(() => {
      sqsPollStub.restore();
      sqsDoneStub.restore();
    });

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

  describe('AWS SDK Interface', () => {
    let sqsStub;
    let numSubscribers;

    describe('sendMessage', () => {
      let sendMessageStub;

      beforeEach(() => {
        [sqsStub, numSubscribers] = amazonSQS._stub();
        sendMessageStub = sinon.stub(sqsStub, 'sendMessage')
          .callsFake((params, callback) => {
            callback(null);
          });
      });

      afterEach(() => {
        sqsStub.sendMessage.restore();
        amazonSQS._restore();
      });

      it(`Should send a message to all subscriber queues when publishing a search event for ${TEST_MARKET}`, () => {
        amazonSQS.publish(stubMessages[0], true);
        expect(sendMessageStub.callCount).to.equal(numSubscribers + 1);
      });

      it(`Should send a message only to the Search queue when publishing a search event not for ${TEST_MARKET}`, () => {
        amazonSQS.publish(stubMessages[0], false);
        expect(sendMessageStub.callCount).to.equal(1);
      });

      it('Should correctly set the parameters of the sendMessage method', () => {
        amazonSQS.publish(stubMessages[0], false);
        const sqsParams = sendMessageStub.args[0][0];
        expect(sqsParams).to.have.ownPropertyDescriptor('QueueUrl');
        expect(sqsParams.QueueUrl).to.be.a('string');
        expect(sqsParams).to.have.ownPropertyDescriptor('MessageBody');
        expect(sqsParams.MessageBody).to.be.a('string');
        expect(JSON.parse(sqsParams.MessageBody)).to.deep.equal(stubMessages[0]);
      });

      it('Should throw an error if sendMessage fails', () => {
        sendMessageStub.callsFake((params, callback) => {
          callback(new Error('sendMessage error'));
        });
        try {
          amazonSQS.publish(stubMessages[0], false);
        } catch (error) {
          expect(error.message).to.equal('sendMessage error');
        }
      });
    });

    describe('receiveMessage', () => {
      let receiveMessageStub;

      beforeEach(() => {
        [sqsStub] = amazonSQS._stub();
        receiveMessageStub = sinon.stub(sqsStub, 'receiveMessage')
          .callsFake((params, callback) => {
            callback(null, {});
          });
      });

      afterEach(() => {
        sqsStub.receiveMessage.restore();
        amazonSQS._restore();
      });

      it('Should receive data from SQS', (done) => {
        amazonSQS.poll(STUB_MESSAGE_BUS_QUEUE)
          .then(() => {
            expect(receiveMessageStub.called).to.be.true;
            done();
          });
      });

      it('Should receive data from the specified queue', (done) => {
        amazonSQS.poll(STUB_MESSAGE_BUS_QUEUE)
          .then(() => {
            const sqsParams = receiveMessageStub.args[0][0];
            expect(sqsParams).to.have.ownPropertyDescriptor('QueueUrl');
            expect(sqsParams.QueueUrl).to.equal(STUB_MESSAGE_BUS_QUEUE);
            done();
          });
      });

      it('Should throw an error if receiveMessage fails', (done) => {
        receiveMessageStub.callsFake((params, callback) => {
          callback(new Error('receiveMessage error'), null);
        });
        amazonSQS.poll(STUB_MESSAGE_BUS_QUEUE)
          .catch((err) => {
            expect(err.message).to.equal('receiveMessage error');
            done();
          });
      });
    });

    describe('deleteMessageBatch', () => {
      let deleteMessageBatchStub;

      beforeEach(() => {
        [sqsStub] = amazonSQS._stub();
        deleteMessageBatchStub = sinon.stub(sqsStub, 'deleteMessageBatch')
          .callsFake((params, callback) => {
            callback(null);
          });
      });

      afterEach(() => {
        sqsStub.deleteMessageBatch.restore();
        amazonSQS._restore();
      });

      it('Should delete messages from the queue', () => {
        amazonSQS.done(STUB_MESSAGE_BUS_QUEUE, stubMessages);
        expect(deleteMessageBatchStub.called).to.be.true;
      });

      it('Should correctly set the parameters of the deleteMessageBatch method', () => {
        amazonSQS.done(STUB_MESSAGE_BUS_QUEUE, stubMessages);
        const stubEntries = stubMessages.map(message => ({
          Id: message.MessageId,
          ReceiptHandle: message.ReceiptHandle,
        }));
        const sqsParams = deleteMessageBatchStub.args[0][0];
        expect(sqsParams).to.have.ownPropertyDescriptor('QueueUrl');
        expect(sqsParams.QueueUrl).to.equal(STUB_MESSAGE_BUS_QUEUE);
        expect(sqsParams).to.have.ownPropertyDescriptor('Entries');
        expect(sqsParams.Entries).to.deep.equal(stubEntries);
      });

      it('Should throw an error if deleteMessageBatch fails', () => {
        deleteMessageBatchStub.callsFake((params, callback) => {
          callback(new Error('deleteMessageBatch error'));
        });
        try {
          amazonSQS.done(STUB_MESSAGE_BUS_QUEUE, stubMessages);
        } catch (error) {
          expect(error.message).to.equal('deleteMessageBatch error');
        }
      });
    });
  });
});
