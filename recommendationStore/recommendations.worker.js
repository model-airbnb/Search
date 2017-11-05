const { recommendationInbox, checkForMessages } = require('../messageBus/index');
const db = require('./model');

const MAX_WORKERS = process.argv[2] || 1;
const SLEEP_MS = 2000;

const createFilter = (rules) => {
  const {
    market, checkIn, checkOut, roomType,
  } = rules;
  return {
    'rules.market': market,
    'rules.checkIn': checkIn,
    'rules.checkOut': checkOut,
    'rules.roomType': roomType,
  };
};

const processRecommendationsEvents = (id) => {
  const taskTimeStart = Date.now();
  let messages;
  checkForMessages(recommendationInbox)
    .then((messageBatch) => {
      messages = messageBatch.map((message) => {
        const { rules, coefficients } = message.payload;
        return {
          rules,
          coefficients: {
            price: coefficients.price || coefficients.priceCoefficient,
          },
        };
      });
      const docUpserts = messages.map(message =>
        db.updateInventoryScoring(createFilter(message.rules), message));
      return Promise.all(docUpserts);
    })
    .then(() => {
      setTimeout(processRecommendationsEvents.bind(this, id), SLEEP_MS);
      console.log(`${id}, messages processed: ${messages.length}, time lapsed: ${Date.now() - taskTimeStart}`);
    })
    .catch(console.error);
};

for (let i = 1; i <= MAX_WORKERS; i += 1) {
  processRecommendationsEvents(i);
}
