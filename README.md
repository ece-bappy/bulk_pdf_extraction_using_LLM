# System Prompt Architect

A dynamic web application for creating structured, domain-specific system prompts with JSON schema validation. Designed to help researchers and developers build precise AI prompts for extracting structured data from research papers and PDFs.

## Features

- **Visual Schema Builder**: Intuitive drag-and-drop interface to define JSON schemas for data extraction
- **Prompt Generation**: Automatically generates system prompts based on your schema and expertise domain
- **AI Integration**: Built-in support for Google Generative AI for processing documents
- **PDF Support**: Integrated PDF.js for handling research paper uploads and processing
- **Template Customization**: Customize prompt templates for different research domains
- **Real-time Validation**: Live JSON schema validation and preview

## Technologies

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **AI**: Google Generative AI (@google/genai)
- **PDF Processing**: PDF.js
- **Styling**: Tailwind CSS (inferred from components)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd system-prompt-architect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Usage

1. Launch the app and click "Get Started"
2. Define your data schema using the visual builder
3. Specify your expertise domain and customize the prompt template
4. Generate the system prompt
5. Copy and use the prompt with your AI model for data extraction from PDFs

## Build

To build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
