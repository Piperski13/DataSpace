const { connectRedis } = require("../config/redisClient");

beforeAll(async () => {
  await connectRedis();
});
