const Redis = require("redis");

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL,
});

// handle connection errors
redisClient.on("error", (err) => console.error("Redis Client Error", err));

const connectRedis = async () => {
  await redisClient.connect();
  console.log("Redis connected");
};

module.exports = {
  redisClient,
  connectRedis,
};
