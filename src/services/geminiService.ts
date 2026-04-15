import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

export const geminiModels = {
  pro: "gemini-3.1-pro-preview",
  flash: "gemini-3-flash-preview",
  lite: "gemini-3.1-flash-lite-preview",
};

export async function analyzeContent(content: string, task: string, thinkingLevel?: ThinkingLevel) {
  try {
    const response = await genAI.models.generateContent({
      model: thinkingLevel ? geminiModels.pro : geminiModels.flash,
      contents: [
        {
          parts: [
            { text: `Task: ${task}\n\nContent:\n${content}` }
          ]
        }
      ],
      config: {
        temperature: thinkingLevel ? undefined : 0.7,
        topP: thinkingLevel ? undefined : 0.95,
        topK: thinkingLevel ? undefined : 64,
        thinkingConfig: thinkingLevel ? { thinkingLevel } : undefined,
      }
    });

    return response.text;
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
