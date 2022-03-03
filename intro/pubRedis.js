const { RedisPubSub } = require('graphql-redis-subscriptions');
const Redis = require('ioredis');

require("dotenv").config()

const options = {
  host: process.env.REDIS_DOMAIN_NAME,
  port: process.env.PORT_NUMBER,
  password: process.env.REDIS_SERVER_PASSWORD,
  retryStrategy: times => {
    // reconnect after
    return Math.min(times * 50, 2000);
  }
};

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options)
});

module.exports = pubsub;