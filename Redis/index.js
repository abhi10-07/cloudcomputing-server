const redis = require("redis");

let redisClient;

const redisConnect = async () => {
  redisClient = redis.createClient();
  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
};

redisConnect();

module.exports = { redisConnect, redisClient };
