import jwt from "jsonwebtoken";
import createRedisClient from "../services/redis.service.js";

export const authorisedUser = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  const redisClient = createRedisClient();

  if (!token) {
    return res.status(401).json({ error: "token not found" });
  }

  const isBlackListed = await redisClient.get(token);

  if (isBlackListed) {
    res.cookies("token", "");
    return res.json({ error: "Unauthorized user" }).status(401);
  }

  try {
    const decoded = jwt.verify(token, process.env.secret_key);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
