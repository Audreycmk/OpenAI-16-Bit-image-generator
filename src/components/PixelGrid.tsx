'use client';

import React from 'react';

type Pixel = {
  row: number;
  col: number;
  hex: string;
};

export default function PixelGrid({ pixels }: { pixels: Pixel[] }) {
  const size = 16;
  const cellSize = 16; // 256 / 16

  const grid = Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size);
    const col = i % size;
    const pixel = pixels.find(p => p.row === row && p.col === col);
    return pixel ? pixel.hex : '#FFFFFF';
  });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
        width: `${size * cellSize}px`,
        height: `${size * cellSize}px`,
        marginTop: '20px',
        border: '1px solid #999',
      }}
    >
      {grid.map((hex, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: hex,
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            border: '0.5px solid #ccc',
            boxSizing: 'border-box',
          }}
        />
      ))}
    </div>
  );
}
