const { connectRedis, redisClient } = require("../config/redisClient");
const pool = require("../db/pool");

beforeAll(async () => {
  await connectRedis();
});

afterAll(async () => {
  await pool.end();
  await redisClient.quit();
});
