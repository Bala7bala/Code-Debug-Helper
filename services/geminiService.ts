import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    language: { type: Type.STRING, description: "The detected programming language (Java, Python, C++, etc.)" },
    errors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, description: "Short error type (e.g., Syntax Error)" },
          line: { type: Type.STRING, description: "Line number or location" },
          description: { type: Type.STRING, description: "Simple beginner-friendly explanation of what is wrong" },
          fix: { type: Type.STRING, description: "The corrected code line" }
        },
        required: ["type", "description", "fix"]
      }
    },
    correctSyntax: { type: Type.STRING, description: "The corrected code snippet focusing on syntax" },
    explanation: { type: Type.STRING, description: "A simple, teacher-like explanation of why the errors happened (max 3 lines)" },
    simplifiedLogic: { type: Type.STRING, description: "A cleaner, simpler version of the logic (optional)" },
    formattedCode: { type: Type.STRING, description: "The full, properly indented and formatted code" },
    learningTips: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Short 1-line memory shortcuts for the user"
    }
  },
  required: ["language", "errors", "correctSyntax", "explanation", "formattedCode"]
};

export const analyzeCode = async (code: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const prompt = `
    You are a friendly, world-class Computer Science tutor for beginners.
    Analyze the following code snippet. 
    
    Your goals:
    1. Detect the language (Java, C, C++, Python, JavaScript).
    2. Find syntax errors (missing semicolons, brackets, types) and logic risks (null pointers, loops).
    3. Explain clearly in simple English (no heavy jargon).
    4. Provide a corrected version.
    5. Provide a simplified logic version if the code is overly complex.
    6. Return the final code formatted beautifully.

    User Code:
    ${code}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are a helpful coding assistant for students. Be encouraging and clear.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};