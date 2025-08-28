import Redis from "ioredis";
const REDIS_PORT = 17241;
const redisPortRaw = REDIS_PORT;
console.log("DEBUG: REDIS_PORT raw value:", REDIS_PORT);

const redisPort = parseInt(redisPortRaw, 10);

if (isNaN(redisPort) || redisPort < 0 || redisPort > 65535) {
  console.error("❌ Invalid REDIS_PORT:", REDIS_PORT);
  throw new Error("REDIS_PORT must be a number between 0 and 65535");
}

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: redisPort,
  password: process.env.REDIS_PASSWORD?.trim() || undefined,
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Connection Error:", err.message);
  console.log("Raw REDIS_PORT:", process.env.REDIS_PORT);
});

export default redisClient;
