# OpenAI 16-Bit Image Generator

A Next.js application that generates 16x16 pixel art using OpenAI's GPT-4 model. Simply describe what you want to create, and watch as the AI generates pixel art one pixel at a time!

## Features

- 🎨 **16x16 Pixel Art Generation**: Create detailed pixel art on a 16x16 grid
- 🤖 **OpenAI GPT-4 Integration**: Powered by OpenAI's latest language model
- ⚡ **Real-time Generation**: Watch pixels appear as the AI creates your image
- 🎯 **Text-to-Pixel**: Describe anything and see it come to life in pixels
- 🎨 **Interactive Interface**: Clean, modern UI with real-time feedback

## Getting Started

### Prerequisites

- Node.js 18+ 
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd openai-16-bit-image-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Navigate to the image generator page
2. Type a description of what you want to create (e.g., "a yellow duck", "Super Mario", "a tree")
3. Press Enter or click "Generate Pixel"
4. Watch as the AI creates your pixel art!

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 API
- **Development**: Turbopack for fast builds

## Project Structure

```
src/
├── app/
│   ├── api/generate-pixel/  # OpenAI API integration
│   ├── image-generator/     # Main generator page
│   └── page.tsx            # Home page
├── components/
│   ├── ImageGenerator.tsx  # Main generator component
│   └── PixelGrid.tsx       # 16x16 grid display
```

## API Configuration

The application uses OpenAI's GPT-4 model to generate pixel art. The AI is instructed to:
- Create recognizable images within a 16x16 grid
- Use appropriate colors and shading
- Generate between 140-256 non-white pixels
- Center and scale the subject appropriately

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).
