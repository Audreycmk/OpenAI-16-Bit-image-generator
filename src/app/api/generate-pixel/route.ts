// app/api/generate-pixels/route.ts
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables in Vercel dashboard or .env.local file.',
          setupInstructions: 'Get your API key from https://platform.openai.com/api-keys and add it to your Vercel environment variables.'
        },
        { status: 500 }
      );
    }

    const systemPrompt = `🎨 You are a professional pixel artist generating 16x16 pixel art based on user prompts.

🧠 Your Task:
1. Create a pixelated image on a 16x16 grid based on the prompt (e.g., "Super Mario", "tree", "yellow duck").
2. The subject must:
   - Fit entirely within the 16x16 canvas.
   - Be centered and proportional.
   - Maximize use of the canvas — try to fill as much of the space as possible.
   - Begin with a clear shape outline, then add internal details.
3. Use between 140 and 256 non-white pixels to form a clear, recognizable, and detailed image.

📐 Layout Rules:
- Use 0-based coordinates:
  - row: 0–15 (top to bottom)
  - column: 0–15 (left to right)
- Background (empty spaces) should remain white (#FFFFFF) and should NOT be included in output.

🎨 Color Guidelines:
- Use realistic, subject-appropriate colors.
- For characters:
  - Prioritize the face, eyes, lips, body, and signature accessories.
- For objects:
  - Use shading and highlights (light, mid, dark tones) to create depth.
  - Outline and silhouette clarity is most important.
- NEVER include white pixels (#FFFFFF) in the output.

📤 Output Format:
- Return ONLY a valid JSON array, with no explanation, text, or code blocks.
- Each entry must include:
  - hexCode (e.g. "#A8E6CF") - any color except white
  - column (0–15)
  - row (0–15)

Example Prompt: "Purple Circle"
Output:
[
  { "hexCode": "#D1B3FF", "column": 6, "row": 3 },
  { "hexCode": "#C084FC", "column": 7, "row": 3 },
  { "hexCode": "#9333EA", "column": 8, "row": 3 },
  { "hexCode": "#D1B3FF", "column": 6, "row": 12 },
  { "hexCode": "#C084FC", "column": 7, "row": 12 },
  { "hexCode": "#9333EA", "column": 8, "row": 12 }
]

CRITICAL RULES:
- Do NOT include white pixels (#FFFFFF) in the output
- Do NOT add any text outside the JSON array
- Do NOT wrap the JSON in code blocks
- Output between 140-256 non-white pixels
- Return ONLY the JSON array, nothing else`;

    console.log(' Sending request to OpenAI with prompt:', prompt);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Generate a complete pixel art image for: "${prompt}"`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    console.log('🔍 OpenAI Response:', response);
    console.log('📝 Raw text length:', response.length);
    
    // Try multiple approaches to extract JSON
    let pixelsArray;
    let cleaned = response.replace(/```json|```/gi, '').trim();
    
    // First try: look for JSON array pattern with more flexible regex
    const jsonMatch = cleaned.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        pixelsArray = JSON.parse(jsonMatch[0]);
        console.log('✅ Parsed JSON from regex match');
      } catch (e) {
        console.log('❌ Failed to parse regex match:', e);
      }
    }
    
    // Second try: if first failed, try to find and fix common JSON issues
    if (!pixelsArray) {
      try {
        // Try to extract just the array part and fix common issues
        let jsonString = cleaned;
        
        // Find the start and end of the array
        const startIndex = jsonString.indexOf('[');
        const endIndex = jsonString.lastIndexOf(']');
        
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          jsonString = jsonString.substring(startIndex, endIndex + 1);
          
          // Fix common JSON issues
          jsonString = jsonString
            .replace(/,\s*]/g, ']') // Remove trailing commas
            .replace(/,\s*}/g, '}') // Remove trailing commas in objects
            .replace(/,\s*$/g, '') // Remove trailing commas at end
            .replace(/\n/g, '') // Remove newlines
            .replace(/\r/g, '') // Remove carriage returns
            .replace(/\t/g, '') // Remove tabs
            .replace(/,\s*,/g, ',') // Remove double commas
            .replace(/,\s*]/g, ']') // Remove commas before closing brackets
            .replace(/,\s*}/g, '}'); // Remove commas before closing braces
          
          pixelsArray = JSON.parse(jsonString);
          console.log('✅ Parsed JSON from cleaned and fixed response');
        }
      } catch (e) {
        console.log('❌ Failed to parse cleaned response:', e);
      }
    }
    
    // Third try: if still failed, try parsing the original response
    if (!pixelsArray) {
      try {
        pixelsArray = JSON.parse(response);
        console.log('✅ Parsed JSON from original response');
      } catch (e) {
        console.log('❌ Failed to parse original response:', e);
        
        // Last resort: try to manually extract pixel data from the response
        console.log('🔄 Attempting manual extraction as last resort...');
        const manualPixels = [];
        
        // Look for pixel patterns in the response
        const pixelPattern = /"hexCode":\s*"([^"]+)",\s*"column":\s*(\d+),\s*"row":\s*(\d+)/g;
        let match;
        
        while ((match = pixelPattern.exec(response)) !== null) {
          const hexCode = match[1];
          const column = parseInt(match[2]);
          const row = parseInt(match[3]);
          
          // Skip white pixels
          if (hexCode.toUpperCase() !== '#FFFFFF' && hexCode.toUpperCase() !== '#FFF') {
            manualPixels.push({
              hexCode: hexCode,
              column: Math.max(0, Math.min(15, column)),
              row: Math.max(0, Math.min(15, row))
            });
          }
        }
        
        if (manualPixels.length > 0) {
          pixelsArray = manualPixels;
          console.log('✅ Manually extracted pixels:', manualPixels.length);
        } else {
          console.log('❌ No valid JSON found in response');
          throw new Error('Invalid response format from OpenAI - no valid JSON found');
        }
      }
    }
    
    console.log('✅ Parsed pixels array:', pixelsArray);
    
    // Validate the response
    if (!Array.isArray(pixelsArray)) {
      console.log('❌ Response is not an array:', pixelsArray);
      throw new Error('Invalid response format - expected array');
    }

    // Filter out white pixels and validate each pixel
    const validatedPixels = pixelsArray
      .filter((pixel, index) => {
        if (!pixel.hexCode || typeof pixel.column !== 'number' || typeof pixel.row !== 'number') {
          console.log(`❌ Invalid pixel at index ${index}:`, pixel);
          return false;
        }
        // Filter out white pixels
        if (pixel.hexCode.toUpperCase() === '#FFFFFF' || pixel.hexCode.toUpperCase() === '#FFF') {
          console.log(`🚫 Filtered out white pixel at index ${index}`);
          return false;
        }
        return true;
      })
      .map((pixel) => ({
        hexCode: pixel.hexCode,
        column: Math.max(0, Math.min(15, Math.floor(pixel.column))),
        row: Math.max(0, Math.min(15, Math.floor(pixel.row)))
      }));
    
    console.log('🎨 Final validated pixels:', validatedPixels);
    console.log('📊 Total pixels generated:', validatedPixels.length);
    
    // Ensure we have enough pixels
    if (validatedPixels.length < 10) {
      console.log('⚠️ Warning: Very few pixels generated, this might be an error');
    }
    
    return NextResponse.json({ pixels: validatedPixels });
  } catch (error) {
    console.error('Error generating pixel:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid or missing OpenAI API key. Please check your .env.local file.' },
          { status: 500 }
        );
      }
      if (error.message.includes('404')) {
        return NextResponse.json(
          { error: 'OpenAI API model not found. Please check the model name.' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate pixel. Please try again.' },
      { status: 500 }
    );
  }
}
