const MS_IN_A_DAY = 1000 * 60 * 60 * 24;

const getLengthOfStay = (request) => {
  const { checkIn, checkOut } = request;
  const msLengthOfStay = (new Date(checkOut)).valueOf() - (new Date(checkIn)).valueOf();
  return msLengthOfStay / MS_IN_A_DAY;
};

module.exports.keyAttributes = message => ({
  searchEventId: message.searchEventId,
  timestamp: message.timestamp,
  market: message.request.market,
  lengthOfStay: getLengthOfStay(message.request),
});

module.exports.reshapeResults = (message) => {
  const listings = [];
  const prices = [];
  const neighbourhoods = [];
  const roomTypes = [];
  const averageRatings = [];
  message.results.forEach((result) => {
    const {
      listingId, neighbourhood, roomType, nightlyPrices, averageRating,
    } = result;
    listings.push(listingId);
    prices.push(...nightlyPrices.map(night => Number(night.price.split('$')[1])));
    neighbourhoods.push(neighbourhood);
    roomTypes.push(roomType);
    averageRatings.push(averageRating);
  });
  return {
    listings, prices, neighbourhoods, roomTypes, averageRatings,
  };
};
