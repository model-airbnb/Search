const elasticsearch = require('elasticsearch');

const host = process.env.ELASTIC_SEARCH_HOST || 'localhost';
const port = process.env.ELASTIC_SEARCH_PORT || 9200;

const client = new elasticsearch.Client({
  host: `${host}:${port}`,
  log: {
    type: 'file',
    level: ['error', 'trace'],
    path: `${__dirname}/elasticsearch.log`,
  },
});

module.exports.bulkInsertDocuments = (index, type, docs) => {
  const action = {
    index: {
      _index: index,
      _type: type,
    },
  };

  const body = [];
  docs.forEach((doc) => {
    body.push(action);
    body.push(doc);
  });

  return client.bulk({ body });
};

module.exports.deleteIndex = (index = '*') =>
  client.indices.delete({ index });
