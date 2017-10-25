const mongoose = require('../db');

const searchQuerySchema = mongoose.Schema({
  searchQueryId: Number,
  timestamp: Date,
  visitId: Number,
  userId: Number,
  market: String,
  checkIn: Date,
  checkOut: Date,
  roomType: String,
});

searchQuerySchema.index({ searchQueryId: 1 }, { unique: true });

const SearchQuery = mongoose.model('SearchQuery', searchQuerySchema);

const emptySearchQueries = () =>
  new Promise((resolve, reject) => {
    SearchQuery.remove({}, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const saveSearchQueries = queries =>
  new Promise((resolve, reject) => {
    SearchQuery.insertMany(queries, (err, docs) => {
      if (err) reject(err);
      else resolve(docs);
    });
  });

module.exports = {
  mongoose,
  emptySearchQueries,
  saveSearchQueries,
};
