# Browser Agent CLI

AI-powered browser automation with natural language commands. Uses [Playwright MCP](https://playwright.dev/agents/playwright-mcp-browser-automation) for browser control and Claude for interpreting commands.

## Prerequisites

- Node.js (for running Playwright MCP server)
- Python 3.11+

## Setup

1. **Install dependencies:**

```bash
uv sync
```

2. **Install Playwright MCP globally:**

```bash
npm install -g @playwright/mcp
```

3. **Set your Anthropic API key:**

```bash
export ANTHROPIC_API_KEY=your-key-here
```

Or create a `.env` file:

```
ANTHROPIC_API_KEY=your-key-here
```

## Usage

```bash
uv run python -m browser_agent https://example.com
```

This will:
1. Start the Playwright MCP server
2. Launch a browser and navigate to the specified URL
3. Start an interactive prompt where you can type natural language commands

### Example Commands

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

- **Natural language commands**: Just describe what you want the browser to do
- **Full browser control**: Click, type, scroll, navigate, screenshot, and more
- **Session persistence**: The browser stays open between commands
- **Conversation history**: Claude remembers context from previous commands
