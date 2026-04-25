import OpenAI from "openai";

const apiKey = "sk-1e04b3c85d31417d88e732fd21364cb3";
const openai = new OpenAI({ 
  apiKey, 
  baseURL: "https://api.deepseek.com",
  dangerouslyAllowBrowser: true 
});

export const aiModels = {
  chat: "deepseek-chat",
  reasoner: "deepseek-reasoner",
};

export async function analyzeContent(content: string, task: string, useReasoner?: boolean) {
  try {
    const response = await openai.chat.completions.create({
      model: useReasoner ? aiModels.reasoner : aiModels.chat,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: `Task: ${task}\n\nContent:\n${content}` }
      ],
      temperature: useReasoner ? undefined : 0.7,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("DeepSeek AI Error:", error);
    throw new Error("Failed to process content with DeepSeek AI.");
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
