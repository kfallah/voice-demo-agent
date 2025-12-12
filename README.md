# Browser Agent CLI

AI-powered browser automation with voice commands. Uses [Playwright MCP](https://playwright.dev/agents/playwright-mcp-browser-automation) for browser control, Claude for interpreting commands, and ElevenLabs for text-to-speech.

## Prerequisites

- Node.js (for running Playwright MCP server)
- Python 3.11+
- ffmpeg (for audio playback in voice mode)

## Setup

1. **Install dependencies:**

```bash
uv sync
```

2. **Install Playwright MCP globally:**

```bash
npm install -g @playwright/mcp
```

3. **Set your API keys:**

```bash
export ANTHROPIC_API_KEY=your-key-here
export OPENAI_API_KEY=your-key-here      # For Whisper speech-to-text
export ELEVENLABS_API_KEY=your-key-here  # For text-to-speech
```

Or create a `.env` file with these values.

## Usage

### Text Mode (default)

```bash
uv run python -m browser_agent https://example.com
```

### Voice Mode

```bash
uv run python -m browser_agent --voice https://example.com
```

In voice mode:
- Press Enter to start recording your voice command
- Press Enter again to stop recording and submit
- The agent will speak what it's doing and its responses

## Example Commands

```
> Click the login button
> Fill in the email field with test@example.com
> Scroll down to the footer
> Take a screenshot
> What text is on this page?
```

### Exiting

Type `quit` or `exit` to close the browser and exit.

## Features

- **Voice input**: Speak commands using your microphone (Whisper transcription)
- **Voice output**: Agent speaks what it's doing (ElevenLabs TTS)
- **Natural language commands**: Just describe what you want the browser to do
- **Full browser control**: Click, type, scroll, navigate, screenshot, and more
- **Conversation history**: Claude remembers context from previous commands
