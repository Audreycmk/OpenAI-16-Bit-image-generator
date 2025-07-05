// lib/gemini-pixel.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Attempts to generate a very basic 16x16 pixel art shape by outputting pixel coordinates.
 * This function uses 'gemini-1.5-flash' and a highly simplified prompt to focus on basic geometry.
 *
 * @param prompt A simple text description of a geometric shape (e.g., "red circle", "blue square").
 * @returns A Promise that resolves to a CSV string of pixel coordinates and hex codes.
 */
export async function analyzePixels(prompt: string): Promise<string> {
  try {
    // Reverting to gemini-1.5-flash for text output (CSV of pixels)
    // The image generation models are not designed for this direct pixel control via text.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Highly simplified prompt, focusing purely on drawing a basic shape.
    // Removed all artistic flair, complex rules, and specific palettes for this test.
    // The goal is to see if it can generate a recognizable pixel shape at all.
    const simplePixelPrompt = `
You are a 16x16 pixel grid artist.
Your task is to draw a flat 2D cartoon style "${prompt}" in the center of the 16x16 grid.
Use only one color for the shape.
Return only CSV, one pixel per line:
(column, row), #HEX

Example for a red square:
(7, 7), #FF0000
(8, 7), #FF0000
(7, 8), #FF0000
(8, 8), #FF0000

⚠️ Only return CSV — no explanations, no titles, no extra text.
`;

    const result = await model.generateContent([
      { text: simplePixelPrompt }
    ]);

    const response = await result.response;
    const text = await response.text();

    console.log("🧠 Gemini raw output (simplified prompt):", text.slice(0, 500)); 
    return text;

  } catch (error) {
    console.error("🚨 Error generating pixels with Gemini:", error);
    throw error;
  }
}
