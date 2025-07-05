'use client';

import { useState } from 'react';
import ImageGenerator from '../../components/ImageGenerator';

export default function ImageGeneratorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-center mb-2 text-3xl font-bold text-blue-600">
          OpenAI GPT-4
        </p>
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          16x16 Image Generator
        </h1>
        <p className="text-center mb-8 text-gray-600">
          Describe what you want to create and watch it appear pixel by pixel!
        </p>
        <ImageGenerator />
      </div>
    </div>
  );
} 