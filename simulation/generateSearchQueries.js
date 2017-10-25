const db = require('./models/searchQueries');

const DATASET_SIZE = 10000000;
const BATCH_SIZE = 1000;
const SEARCH_QUERY_ID_START = 5000000;
const VISIT_ID_START = 1;
const USER_ID_RANGE = 100000;
const SEARCH_FREQUENCY_IN_SECONDS = 30;
const MARKETS = [
  'San Francisco', 'Seattle', 'Sydney', 'New York', 'Toronto', 'Paris',
  'London', 'Hong Kong', 'Amsterdam', 'Montreal',
];
const MAX_DAYS_UNTIL_TRAVEL = 45;
const MAX_LENGTH_OF_STAY = 7;
const ROOM_TYPES = ['any', 'entire home', 'private', 'shared room'];

/* ----- HELPER FUNCTIONS BEGIN ----- */

const incrementIdFrom = (num) => {
  let startId = num;
  return () => {
    startId += 1;
    return startId;
  };
};

const getRandomUser = () =>
  Math.ceil(Math.random() * USER_ID_RANGE);

const countTimeFrom = (now) => {
  const timestamp = now;
  return () => {
    const timeLapsed = Math.ceil(Math.random() * SEARCH_FREQUENCY_IN_SECONDS);
    timestamp.setSeconds(timestamp.getSeconds() + timeLapsed);
    return timestamp;
  };
};

const getRandomMarket = () =>
  MARKETS[Math.floor(Math.random() * MARKETS.length)];

const getRandomDateRange = () => {
  const daysUntilTravel = Math.ceil(Math.random() * MAX_DAYS_UNTIL_TRAVEL);
  const lengthOfStay = Math.ceil(Math.random() * MAX_LENGTH_OF_STAY);
  const checkIn = new Date();
  const checkOut = new Date();
  checkIn.setDate(checkIn.getDate() + daysUntilTravel);
  checkOut.setDate(checkOut.getDate() + daysUntilTravel + lengthOfStay);
  return { checkIn, checkOut };
};

const getRandomRoomType = () =>
  ROOM_TYPES[Math.floor(Math.random() * ROOM_TYPES.length)];

/* ----- HELPER FUNCTIONS END ----- */

const nextSearchQueryId = incrementIdFrom(SEARCH_QUERY_ID_START);
const nextVisitId = incrementIdFrom(VISIT_ID_START);
const nextSearchTimestamp = countTimeFrom(new Date());

const generateQueryBatch = () => {
  const queries = [];
  for (let i = 0; i < BATCH_SIZE; i += 1) {
    const { checkIn, checkOut } = getRandomDateRange();
    const query = {
      searchQueryId: nextSearchQueryId(),
      timestamp: nextSearchTimestamp(),
      visitId: nextVisitId(),
      userId: getRandomUser(),
      market: getRandomMarket(),
      checkIn,
      checkOut,
      roomType: getRandomRoomType(),
    };
    queries.push(query);
  }
  return db.saveSearchQueries(queries);
};

let async = db.emptySearchQueries();
for (let i = 0; i < DATASET_SIZE / BATCH_SIZE; i += 1) {
  async = async.then(generateQueryBatch)
    .then(() => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`${i * BATCH_SIZE} / ${DATASET_SIZE} search queries generated and saved.`);
    });
}
async.then(() => {
  console.log(`SEARCH QUERY GENERATION: ${DATASET_SIZE} search queries generated and saved.`);
  db.mongoose.connection.close();
});
