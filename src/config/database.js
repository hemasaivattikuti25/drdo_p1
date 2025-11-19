require('dotenv').config();

const config = {
  mongodb: {
    standalone: process.env.MONGO_URI_STANDALONE,
    replica: process.env.MONGO_URI_REPLICA,
    useReplica: process.env.NODE_ENV === 'production'
  },
  server: {
    port: process.env.PORT || 3000
  }
};

const getMongoURI = () => {
  return config.mongodb.useReplica ? config.mongodb.replica : config.mongodb.standalone;
};

module.exports = {
  config,
  getMongoURI
};
