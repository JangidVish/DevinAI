import { generateResult } from "../services/ai.service.js";

export const getresultaiController = async (req, res) => {
  try {
    const { prompt } = req.query;
    const result = await generateResult(prompt);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
