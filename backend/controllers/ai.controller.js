// controllers/ai.controller.js
import { generateResult } from "../services/ai.service.js";

export const getresultaiController = async (req, res) => {
  try {
    // console.log("AI controller hit (HTTP)");
    const { prompt } = req.body;
    // console.log("Prompt received:", prompt);

    const result = await generateResult(prompt);
    // console.log("Result from AI service:", result);

    res.json({ result });
  } catch (error) {
    console.log("Error in AI controller:", error);
    res.status(500).send({ message: error.message });
  }
};

export const getResultForSocket = async (prompt) => {
  try {
    // console.log("AI controller hit (SOCKET)");
    console.log("Prompt received:", prompt);

    const result = await generateResult(prompt);
    // console.log("Result from AI service:", result);

    return result;
  } catch (error) {
    console.log("Error in AI socket controller:", error);
    return "An error occurred while generating AI response.";
  }
};
