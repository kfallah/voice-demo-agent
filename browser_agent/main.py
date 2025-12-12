"""CLI entry point for the browser agent using Playwright MCP."""

import argparse
import asyncio
import json
import sys

import anthropic
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client


async def run_agent(url: str) -> None:
    """Launch browser via Playwright MCP and start interactive REPL."""
    print("Starting Playwright MCP server...")

    server_params = StdioServerParameters(
        command="npx",
        args=["@playwright/mcp"],
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Get available tools from MCP server
            tools_response = await session.list_tools()
            mcp_tools = tools_response.tools

            # Convert MCP tools to Anthropic tool format
            anthropic_tools = []
            for tool in mcp_tools:
                anthropic_tools.append({
                    "name": tool.name,
                    "description": tool.description or "",
                    "input_schema": tool.inputSchema,
                })

            # Navigate to initial URL
            print(f"Navigating to {url}...")
            await session.call_tool("browser_navigate", {"url": url})

            print("Ready! Type commands for the browser agent.")
            print("Type 'quit' or 'exit' to close.\n")

            client = anthropic.Anthropic()
            conversation_history = []

            while True:
                try:
                    user_input = input("> ").strip()
                except EOFError:
                    break

                if not user_input:
                    continue

                if user_input.lower() in ("quit", "exit"):
                    print("Closing browser...")
                    break

                # Add user message to history
                conversation_history.append({
                    "role": "user",
                    "content": user_input,
                })

                # Call Claude with tools
                try:
                    response = client.messages.create(
                        model="claude-sonnet-4-5-20250929",
                        max_tokens=4096,
                        system="You are a browser automation assistant. Use the available browser tools to help the user interact with the current web page. Be concise in your responses.",
                        tools=anthropic_tools,
                        messages=conversation_history,
                    )

                    # Process response
                    while response.stop_reason == "tool_use":
                        # Extract tool calls
                        assistant_content = response.content
                        conversation_history.append({
                            "role": "assistant",
                            "content": assistant_content,
                        })

                        # Execute each tool call
                        tool_results = []
                        for block in assistant_content:
                            if block.type == "tool_use":
                                tool_name = block.name
                                tool_input = block.input
                                print(f"  → {tool_name}: {json.dumps(tool_input)}")

                                try:
                                    result = await session.call_tool(tool_name, tool_input)
                                    result_content = result.content[0].text if result.content else "OK"
                                except Exception as e:
                                    result_content = f"Error: {e}"

                                tool_results.append({
                                    "type": "tool_result",
                                    "tool_use_id": block.id,
                                    "content": result_content,
                                })

                        # Add tool results to history
                        conversation_history.append({
                            "role": "user",
                            "content": tool_results,
                        })

                        # Continue conversation
                        response = client.messages.create(
                            model="claude-sonnet-4-5-20250929",
                            max_tokens=4096,
                            system="You are a browser automation assistant. Use the available browser tools to help the user interact with the current web page. Be concise in your responses.",
                            tools=anthropic_tools,
                            messages=conversation_history,
                        )

                    # Print final text response
                    final_text = ""
                    for block in response.content:
                        if hasattr(block, "text"):
                            final_text += block.text

                    if final_text:
                        print(f"\n{final_text}\n")

                    conversation_history.append({
                        "role": "assistant",
                        "content": response.content,
                    })

                except Exception as e:
                    print(f"Error: {e}")


def main() -> None:
    """Parse arguments and run the agent."""
    parser = argparse.ArgumentParser(
        description="AI-powered browser agent with natural language commands"
    )
    parser.add_argument(
        "url",
        help="Website URL to navigate to"
    )
    args = parser.parse_args()

    try:
        asyncio.run(run_agent(args.url))
    except KeyboardInterrupt:
        print("\nInterrupted. Closing...")
        sys.exit(0)


if __name__ == "__main__":
    main()
