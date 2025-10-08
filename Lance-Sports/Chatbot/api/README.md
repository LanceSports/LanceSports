# DeepSeek Chatbot API

A simple Express.js API that integrates with DeepSeek's chat models.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Add your DeepSeek API key to the `.env` file:
```
DEEPSEEK_API_KEY=your_actual_api_key_here
```

4. Update the system prompt in `src/prompts/system.ts` with your chatbot's role and behavior.

## Running

Development mode:
```bash
npm run dev
```

Build and start:
```bash
npm run build
npm start
```

## API Endpoint

- **POST** `/api/chat`
  - Body: `{ "message": "your message here" }`
  - Response: `{ "reply": "bot response" }`

## Configuration

- Edit `src/prompts/system.ts` to customize your chatbot's behavior
- Modify `src/config/env.ts` for environment variables
- Update the model in `src/services/deepseek.ts` if needed

## DeepSeek Models Available

- `deepseek-chat` (default)
- `deepseek-coder` (for coding tasks)
