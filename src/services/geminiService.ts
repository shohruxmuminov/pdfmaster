import { GoogleGenerativeAI } from "@google/generative-ai";

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY || "";
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

export const aiModels = {
  chat: "gemini-1.5-flash",
};

export async function analyzeContent(content: string, task: string) {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: aiModels.chat });
    const result = await model.generateContent(`Task: ${task}\n\nContent:\n${content}`);
    return result.response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Failed to process content with Gemini AI.");
  }
}

export async function translateContent(content: string, targetLanguage: string) {
  return analyzeContent(content, `Translate the following text to ${targetLanguage}. Preserve the formatting as much as possible.`);
}

export async function summarizeContent(content: string) {
  return analyzeContent(content, "Provide a concise summary of the following content. Use bullet points for key takeaways.");
}

export async function improveWriting(content: string) {
  return analyzeContent(content, "Improve the writing quality of the following text. Make it more professional and clear while keeping the original meaning.");
}
