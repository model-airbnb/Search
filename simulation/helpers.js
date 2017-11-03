const Chance = require('chance');

const chance = new Chance(Date.now());
const USER_ID_RANGE = 100000;
const MAX_DAYS_UNTIL_TRAVEL = 45;
const MAX_LENGTH_OF_STAY = 7;
const markets = [
  'San Francisco', 'Sydney', 'New York', 'Toronto', 'Paris', 'London', 'Amsterdam',
];
const roomTypes = ['any', 'Entire home/apt', 'Private room', 'Shared room'];

module.exports.getRandomUser = () =>
  chance.integer({ min: 1, max: USER_ID_RANGE });

module.exports.getRandomMarket = () =>
  markets[chance.integer({ min: 0, max: markets.length - 1 })];

module.exports.getRandomDateRange = () => {
  const daysUntilTravel = chance.integer({ min: 1, max: MAX_DAYS_UNTIL_TRAVEL });
  const lengthOfStay = chance.integer({ min: 1, max: MAX_LENGTH_OF_STAY });
  const checkIn = new Date();
  const checkOut = new Date();
  checkIn.setDate(checkIn.getDate() + daysUntilTravel);
  checkOut.setDate(checkOut.getDate() + daysUntilTravel + lengthOfStay);
  return { checkIn, checkOut };
};

module.exports.getRandomRoomType = () =>
  roomTypes[chance.integer({ min: 0, max: roomTypes.length - 1 })];
