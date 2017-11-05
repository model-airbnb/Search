const mongoose = require('./config');

const inventoryScoringSchema = mongoose.Schema({
  rules: {
    market: String,
    checkIn: String,
    checkOut: String,
  },
  coefficients: {
    price: Number,
  },
});

const keys = { 'rules.market': 1, 'rules.checkIn': 1, 'rules.checkOut': 1 };
inventoryScoringSchema.index(keys, { unique: true });

const inventoryScoring = mongoose.model('InventoryScoring', inventoryScoringSchema);

const createFilter = (doc) => {
  const { market, checkIn, checkOut } = doc.rules;
  return {
    'rules.market': market,
    'rules.checkIn': checkIn,
    'rules.checkOut': checkOut,
  };
};

module.exports.updateInventoryScoring = doc =>
  new Promise((resolve, reject) => {
    inventoryScoring.update(createFilter(doc), doc, { upsert: true }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

module.exports.getInventoryScoring = rule =>
  new Promise((resolve, reject) => {
    inventoryScoring.find(createFilter(rule), (err, doc) => {
      if (err) reject(err);
      else resolve(doc);
    });
  });
