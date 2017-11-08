const AVAILABILITY_YEAR_MONTH = '2018-03';
const SINGLE_AVAILABILITY_DAY = '26';
const NO_AVAILABILITY_DAY = '12';
const AVAILABLE_RANGE_START_DAY = '19';
const AVAILABLE_RANGE_END_DAY = '22';

const availableDateRange = [];
for (let d = parseInt(AVAILABLE_RANGE_START_DAY, 10);
  d <= parseInt(AVAILABLE_RANGE_END_DAY, 10); d += 1) {
  availableDateRange.push(`${AVAILABILITY_YEAR_MONTH}-${d}`);
}

module.exports = {
  TEST_MARKET: 'San Francisco',
  NO_LISTINGS_MARKET: 'Atlantis',

  NUM_TOTAL_LISTINGS: 5,
  NUM_SINGLE_AVAILABILITY_LISTINGS: 4,
  NUM_RANGE_AVAILABLE_LISTINGS: 2,

  SINGLE_AVAILABILITY_DATE: `${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}`,
  NO_AVAILABILITY_DATE: `${AVAILABILITY_YEAR_MONTH}-${NO_AVAILABILITY_DAY}`,

  AVAILABLE_DATE_RANGE_START: `${AVAILABILITY_YEAR_MONTH}-${AVAILABLE_RANGE_START_DAY}`,
  AVAILABLE_DATE_RANGE_END: `${AVAILABILITY_YEAR_MONTH}-${AVAILABLE_RANGE_END_DAY}`,
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

module.exports.availabilityAttributes = '(listing_id, market, inventory_date, price)';
const availability = [
  `(1427660, 'San Francisco', '${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}', '$155.00')`,
  `(1931937, 'San Francisco', '${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}', '$95.00')`,
  `(21065885, 'San Francisco', '${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}', '$2,525.00')`,
  `(16362304, 'San Francisco', '${AVAILABILITY_YEAR_MONTH}-${SINGLE_AVAILABILITY_DAY}', '$79.00')`,
];

availability.push(...availableDateRange.map(date =>
  `(8001958, 'San Francisco', '${date}', '$101.00')`));

availability.push(...availableDateRange.map(date =>
  `(1931937, 'San Francisco', '${date}', '$125.00')`));

module.exports.availability = availability;
