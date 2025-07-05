'use client';

import { useState, useCallback } from 'react';

interface Pixel {
  color: string;
  isSet: boolean;
}

interface GeminiResponse {
  pixels: Array<{
    hexCode: string;
    column: number;
    row: number;
  }>;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixels, setPixels] = useState<Pixel[][]>(
    Array(16).fill(null).map(() => 
      Array(16).fill(null).map(() => ({ color: '#FFFFFF', isSet: false }))
    )
  );

  const generatePixel = useCallback(async () => {
    if (!prompt.trim()) return;

    // Clear the canvas immediately
    setPixels(
      Array(16)
        .fill(null)
        .map(() =>
          Array(16)
            .fill(null)
            .map(() => ({ color: '#FFFFFF', isSet: false }))
        )
    );

    setIsGenerating(true);
    setError(null);
    
    console.log('🎯 Frontend: Starting pixel generation for prompt:', prompt);
    
    try {
      const response = await fetch('/api/generate-pixel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      console.log('📡 Frontend: API response status:', response.status);
      const data = await response.json();
      console.log('📦 Frontend: API response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate pixel');
      }

      const pixelData: GeminiResponse = data;
      console.log('✅ Frontend: Received pixel data:', pixelData);
      
      setPixels(prev => {
        const newPixels = prev.map(row => [...row]);
        
        // Place all pixels from the array
        pixelData.pixels.forEach((pixel, index) => {
          if (pixel.row >= 0 && pixel.row < 16 && pixel.column >= 0 && pixel.column < 16) {
            newPixels[pixel.row][pixel.column] = {
              color: pixel.hexCode,
              isSet: true
            };
            console.log(`🎨 Frontend: Placed pixel ${index + 1} at`, pixel.row, pixel.column, 'with color', pixel.hexCode);
          }
        });
        
        return newPixels;
      });
    } catch (error) {
      console.error('❌ Frontend: Error generating pixel:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate pixel. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

  const clearCanvas = () => {
    setPixels(Array(16).fill(null).map(() => 
      Array(16).fill(null).map(() => ({ color: '#FFFFFF', isSet: false }))
    ));
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isGenerating) {
      generatePixel();
    }
  };

  return (
    <div className="space-y-6">
      {/* Text Input */}
      <div className="flex gap-4 items-center justify-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe what you want to create (e.g., 'a yellow duck')"
          className="flex-1 max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
          disabled={isGenerating}
        />
        <button
          onClick={generatePixel}
          disabled={isGenerating || !prompt.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Pixel'}
        </button>
        <button
          onClick={clearCanvas}
          className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            {error.includes('API key') && (
              <p className="text-sm mt-2">
                Please add your Gemini API key to the <code>.env.local</code> file
              </p>
            )}
          </div>
        </div>
      )}

      {/* 16x16 Grid */}
      <div className="flex justify-center">
        <div className="grid grid-cols-16 gap-0 border-2 border-gray-300 bg-white shadow-lg">
          {pixels.map((row, rowIndex) =>
            row.map((pixel, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="w-8 h-8 border border-gray-200 transition-colors duration-200"
                style={{
                  backgroundColor: pixel.color,
                  borderColor: pixel.isSet ? '#000' : '#e5e7eb'
                }}
                title={`Row ${rowIndex + 1}, Column ${colIndex + 1} - ${pixel.color}`}
              />
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-600">
        <p>The result is generated by <b>Gemini AI</b> and is abstract—play with it for fun!</p>
        <p>Press Enter or click "Generate Pixel" to add pixels one by one</p>
        <p>Each pixel art is an abstract creation by Gemini AI—see what it comes up with!</p>
      </div>
    </div>
  );
} 