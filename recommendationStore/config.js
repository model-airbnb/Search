const mongoose = require('mongoose');

const host = process.env.SEARCH_DATA_HOST || 'localhost';
const db = process.env.SEARCH_RECOMMENDATIONS_DB || 'searchRecommendations';

mongoose.connect(`mongodb://${host}/${db}`);

module.exports = mongoose;
