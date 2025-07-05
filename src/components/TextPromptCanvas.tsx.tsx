'use client';
import React, { useState } from 'react';
import axios from 'axios';
import PixelGrid from './PixelGrid';

export default function TextPromptCanvas() {
  const [prompt, setPrompt] = useState('');
  const [pixels, setPixels] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/generate-pixels', { prompt });
      setPixels(res.data.pixels);
    } catch (err) {
      console.error(err);
      alert('Error generating pixels');
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <input
        type="text"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        placeholder="Try 'Super Mario'"
        className="w-full border px-3 py-2 mb-4 text-lg rounded"
      />
      <button
        onClick={generateImage}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate 16×16 Pixel Art
      </button>

      {loading && <p className="mt-4">Generating...</p>}
      {pixels.length > 0 && <PixelGrid pixels={pixels} />}
    </div>
  );
}
