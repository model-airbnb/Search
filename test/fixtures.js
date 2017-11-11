const TEST_MARKET = 'San Francisco';
const AVAILABILITY_YEAR_MONTH = '2018-03';
const SINGLE_AVAILABILITY_DAY = 26;
const NO_AVAILABILITY_DAY = 12;
const AVAILABLE_RANGE_START_DAY = 19;
const AVAILABLE_RANGE_END_DAY = 22;

const availableDateRange = [];
for (let d = AVAILABLE_RANGE_START_DAY; d <= AVAILABLE_RANGE_END_DAY; d += 1) {
  availableDateRange.push(`${AVAILABILITY_YEAR_MONTH}-${d}`);
}

module.exports = {
  TEST_MARKET,
  TEST_MARKET_URI_ENCODED: 'San%20Francisco',
  NO_LISTINGS_MARKET: 'Atlantis',

  NUM_TOTAL_LISTINGS: 5,
  NUM_SINGLE_AVAILABILITY_LISTINGS: 4,
  NUM_RANGE_AVAILABLE_LISTINGS: 2,

  SINGLE_AVAILABILITY_DATE: `${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}`,
  SINGLE_AVAILABILITY_CHECKOUT: `${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY + 1}`,

  NO_AVAILABILITY_DATE: `${AVAILABILITY_YEAR_MONTH}-${NO_AVAILABILITY_DAY}`,
  NO_AVAILABILITY_CHECKOUT: `${AVAILABILITY_YEAR_MONTH}-${NO_AVAILABILITY_DAY + 1}`,

  AVAILABLE_DATE_RANGE_START: `${AVAILABILITY_YEAR_MONTH}-${AVAILABLE_RANGE_START_DAY}`,
  AVAILABLE_DATE_RANGE_END: `${AVAILABILITY_YEAR_MONTH}-${AVAILABLE_RANGE_END_DAY}`,
  AVAILABLE_DATE_RANGE_CHECKOUT: `${AVAILABILITY_YEAR_MONTH}-${AVAILABLE_RANGE_END_DAY + 1}`,
  AVAILABLE_DATE_RANGE_LENGTH: 4,

  LISTINGS_TABLE: 'listings',
  AVAILABILITY_TABLE: 'availability',
};

module.exports.listingAttributes = '(id, name, host_name, market, neighbourhood, room_type, average_rating)';
module.exports.listings = [
  '(8001958, \'Ocean and park front panoramic view\', \'Raul\', \'San Francisco\', \'Seacliff\', \'Entire home/apt\', 74)',
  '(1427660, \'Charming Studio Apt at Ocean Beach\', \'Laurie\', \'San Francisco\', \'Seacliff\', \'Entire home/apt\', 90)',
  '(1931937, \'Blocks from GG Park & Ocean Beach\', \'Noam\', \'San Francisco\', \'Seacliff\', \'Private room\', 87)',
  '(21065885, \'Golden Gate Penthouse Suite at Casa al Mare\', \'Jennifer\', \'San Francisco\', \'Seacliff\', \'Private room\', 97)',
  '(16362304, \'Best Master Suite in Town\', \'Harris\', \'San Francisco\', \'Seacliff\', \'Private room\', 96)',
];

module.exports.newListing = {
  listings_id: 12345,
  listingName: 'This is a new listing',
  hostName: 'Christine',
  market: 'San Francisco',
  neighbourhood: 'Mission',
  roomType: 'Entire home/apt',
  averageRating: 100,
};

module.exports.availabilityAttributes = '(listing_id, market, inventory_date, price)';
const availability = [
  `(1427660, ${TEST_MARKET}, '${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}', '$155.00')`,
  `(1931937, ${TEST_MARKET}, '${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}', '$95.00')`,
  `(21065885, ${TEST_MARKET}, '${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}', '$2,525.00')`,
  `(16362304, ${TEST_MARKET}, '${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}', '$79.00')`,
];

availability.push(...availableDateRange.map(date =>
  `(8001958, 'San Francisco', '${date}', '$101.00')`));

availability.push(...availableDateRange.map(date =>
  `(1931937, 'San Francisco', '${date}', '$125.00')`));

module.exports.availability = availability;

module.exports.newAvailability = {
  listingId: 8001958,
  inventoryDate: `${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY + 1}`,
  price: '$1.00',
};

module.exports.stubSearchParams = {
  userId: '0000000',
  market: TEST_MARKET,
  checkIn: `${AVAILABILITY_YEAR_MONTH}-${AVAILABLE_RANGE_START_DAY}`,
  checkOut: `${AVAILABILITY_YEAR_MONTH}-${AVAILABLE_RANGE_END_DAY + 1}`,
  roomType: 'any',
  limit: 10,
};

module.exports.stubListings = [
  {
    id: 2539,
    name: 'Clean & quiet apt home by the park',
    host_name: 'John',
    market: 'New York',
    neighbourhood: 'Kensington',
    room_type: 'Private room',
    average_rating: 72,
    dates: [new Date('2017-11-24'), new Date('2017-11-25')],
    prices: ['$99.00', '$99.00'],
  },
  {
    id: 2595,
    name: 'Midtown Castle',
    host_name: 'Jennifer',
    market: 'New York',
    neighbourhood: 'Midtown',
    room_type: 'Entire home/apt',
    average_rating: 30,
    dates: [new Date('2017-11-24'), new Date('2017-11-25')],
    prices: ['$198.00', '$200.00'],
  },
  {
    id: 3330,
    name: '++ Brooklyn Penthouse Guestroom ++',
    host_name: 'Julia',
    market: 'New York',
    neighbourhood: 'Williamsburg',
    room_type: 'Private room',
    average_rating: 49,
    dates: [new Date('2017-11-24'), new Date('2017-11-25')],
    prices: ['$70.00', '$75.00'],
  },
];

module.exports.stubResults = [
  {
    listingId: 2539,
    listingName: 'Clean & quiet apt home by the park',
    hostName: 'John',
    market: 'New York',
    neighbourhood: 'Kensington',
    roomType: 'Private room',
    nightlyPrices: [
      {
        date: '2017-11-24',
        price: '$99.00',
      },
      {
        date: '2017-11-25',
        price: '$99.00',
      },
    ],
    averageRating: 72,
    score: 1,
  },
  {
    listingId: 2595,
    listingName: 'Midtown Castle',
    hostName: 'Jennifer',
    market: 'New York',
    neighbourhood: 'Midtown',
    roomType: 'Entire home/apt',
    nightlyPrices: [
      {
        date: '2017-11-24',
        price: '$198.00',
      },
      {
        date: '2017-11-25',
        price: '$200.00',
      },
    ],
    averageRating: 30,
    score: 2,
  },
  {
    listingId: 3330,
    listingName: '++ Brooklyn Penthouse Guestroom ++',
    hostName: 'Julia',
    market: 'New York',
    neighbourhood: 'Williamsburg',
    roomType: 'Private room',
    nightlyPrices: [
      {
        date: '2017-11-24',
        price: '$70.00',
      },
      {
        date: '2017-11-25',
        price: '$75.00',
      },
    ],
    averageRating: 49,
    score: 3,
  },
];

module.exports.stubOperationLog = {
  httpSearchRequest: {
    timestamp: '2017-09-25T00:13:18.767Z',
    msTimeLapsed: 0,
  },
  dbFetchListings: {
    timestamp: '2017-09-25T00:13:18.767Z',
    msTimeLapsed: 70,
  },
  dbFetchCoefficients: {
    timestamp: '2017-09-25T00:13:18.767Z',
    msTimeLapsed: 16,
  },
  sortListings: {
    timestamp: '2017-09-25T00:13:18.837Z',
    msTimeLapsed: 0,
  },
};

module.exports.stubMessages = [
  {
    MessageId: 'message1',
    ReceiptHandle: 'message1Receipt',
    Body: '{ "a": 1, "b": 2}',
  },
  {
    MessageId: 'message2',
    ReceiptHandle: 'message2Receipt',
    Body: '{ "a": 3, "b": 4}',
  },
];
