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
    },
    output: { type: Type.STRING, description: "The console output of the CORRECTED code." }
  },
  required: ["language", "errors", "correctSyntax", "explanation", "formattedCode"]
};

export const analyzeCode = async (
  code: string, 
  attachment?: { mimeType: string, data: string }
): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  // Build the prompt instruction
  const systemInstruction = `
    You are a friendly, world-class Computer Science tutor for beginners.
    
    If an image or PDF is provided, first transcribe the code visible in it.
    Then, analyze the code (either from the file or the text provided).
    
    Your goals:
    1. Detect the language (Java, C, C++, Python, JavaScript).
    2. Find syntax errors (missing semicolons, brackets, types) and logic risks (null pointers, loops).
    3. Explain clearly in simple English (no heavy jargon).
    4. Provide a corrected version.
    5. Provide a simplified logic version if the code is overly complex.
    6. Return the final code formatted beautifully.
    7. Provide the simulated console output of the program (using the corrected code).
  `;

  // Build content parts
  const parts: any[] = [];

  if (attachment) {
    parts.push({
      inlineData: {
        mimeType: attachment.mimeType,
        data: attachment.data
      }
    });
    parts.push({
      text: "Analyze the code found in this image/file. " + (code ? `Also consider this user context: ${code}` : "")
    });
  } else {
    parts.push({
      text: `Analyze this code:\n${code}`
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: systemInstruction,
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

export const executeCode = async (
  code: string,
  attachment?: { mimeType: string, data: string }
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing");
  }

  const systemInstruction = `
    You are a code execution engine. 
    1. Transcribe any code from images if provided.
    2. Simulate the execution of the user's code.
    3. Return ONLY the console output (stdout) as a raw string.
    4. If there are compilation or runtime errors, return the error message as the output.
    5. Do not include markdown formatting (like \`\`\`), do not write "Output:", just the raw result.
  `;

  const parts: any[] = [];
  if (attachment) {
    parts.push({
      inlineData: {
        mimeType: attachment.mimeType,
        data: attachment.data
      }
    });
    parts.push({
      text: "Run the code found in this image/file. " + (code ? `Also consider this user context: ${code}` : "")
    });
  } else {
    parts.push({
      text: `Run this code and show the output:\n${code}`
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "text/plain",
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "No output returned.";
  } catch (error) {
    console.error("Gemini Execution Error:", error);
    return "Error executing code. Please try again.";
  }
};
