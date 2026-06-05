const { createClient } = require("redis");

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 2) {
            // End reconnecting after 3 attempts
            return false;
          }
          return 1000; // reconnect after 1s
        }
      }
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("Redis Connected Successfully");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Redis Connection Failed:", error.message);
    console.log("App will continue without Redis caching");
    redisClient = null;
    return null;
  }
};

const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
