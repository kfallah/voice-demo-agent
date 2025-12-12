"""CLI entry point for the browser agent using Playwright MCP."""

import argparse
import asyncio
import io
import json
import os
import re
import select
import sys
import tempfile
import termios
import threading
import time
import tty
import wave

import anthropic
import numpy as np
import openai
import requests
import sounddevice as sd
from elevenlabs import ElevenLabs
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Global interrupt event - set when Escape is pressed
_interrupted = threading.Event()
_original_terminal_settings = None
_keyboard_thread = None
_keyboard_thread_running = False


def _keyboard_monitor():
    """Background thread that monitors for Escape key."""
    global _keyboard_thread_running
    
    while _keyboard_thread_running:
        # Check if there's input available
        if select.select([sys.stdin], [], [], 0.05)[0]:
            try:
                char = sys.stdin.read(1)
                if char == '\x1b':  # Escape character
                    _interrupted.set()
                    sd.stop()
            except Exception:
                pass


def start_keyboard_listener():
    """Start the keyboard listener for escape key detection."""
    global _original_terminal_settings, _keyboard_thread, _keyboard_thread_running
    
    try:
        # Save original terminal settings
        _original_terminal_settings = termios.tcgetattr(sys.stdin)
        # Set terminal to raw mode (non-blocking, no echo for special keys)
        tty.setcbreak(sys.stdin.fileno())
        
        # Start background thread to monitor keyboard
        _keyboard_thread_running = True
        _keyboard_thread = threading.Thread(target=_keyboard_monitor, daemon=True)
        _keyboard_thread.start()
    except Exception as e:
        print(f"  (Could not enable keyboard interrupt: {e})")


def stop_keyboard_listener():
    """Stop the keyboard listener and restore terminal settings."""
    global _original_terminal_settings, _keyboard_thread_running
    
    _keyboard_thread_running = False
    
    # Restore original terminal settings
    if _original_terminal_settings is not None:
        try:
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, _original_terminal_settings)
        except Exception:
            pass


def is_interrupted() -> bool:
    """Check if an interrupt was requested."""
    return _interrupted.is_set()


def clear_interrupt() -> None:
    """Clear the interrupt flag."""
    _interrupted.clear()

# Audio settings
SAMPLE_RATE = 16000
CHANNELS = 1

# ElevenLabs settings
ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # George - natural conversational voice


SYSTEM_PROMPT= """You are a technical expert providing a demo to a non-technical audience on a new feature shipped in our product. You will be provided context on the code change and be given tools to interact with the browser running the product with the feature. Start by introducing yourself and the feature you are demonstrating. Your job is to control the browser to demonstrate the feature to the audience. They will ask questions and you will answer them. Be concise in your responses."""


def fetch_pr_diff(pr_url: str) -> str:
    """Fetch PR information and diff from GitHub API.
    
    Args:
        pr_url: GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)
    
    Returns:
        Combined string with PR title, description, and file changes.
    """
    # Parse the PR URL to extract owner, repo, and PR number
    match = re.match(r"https://github\.com/([^/]+)/([^/]+)/pull/(\d+)", pr_url)
    if not match:
        raise ValueError(f"Invalid GitHub PR URL format: {pr_url}")
    
    owner, repo, pr_number = match.groups()
    
    # Get GitHub token from environment
    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        raise ValueError("GITHUB_TOKEN environment variable is required")
    
    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json",
    }
    
    # Fetch PR details
    pr_response = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}",
        headers=headers,
    )
    pr_response.raise_for_status()
    pr_data = pr_response.json()
    
    # Fetch PR files (contains patches/diffs)
    files_response = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/files",
        headers=headers,
    )
    files_response.raise_for_status()
    files_data = files_response.json()
    
    # Build combined PR content
    pr_content = f"""# PR #{pr_number}: {pr_data.get('title', 'Untitled')}

## Description
{pr_data.get('body', 'No description provided.')}

## Changed Files
"""
    
    for file_info in files_data:
        filename = file_info.get("filename", "unknown")
        status = file_info.get("status", "modified")
        additions = file_info.get("additions", 0)
        deletions = file_info.get("deletions", 0)
        patch = file_info.get("patch", "")
        
        pr_content += f"\n### {filename} ({status}, +{additions}/-{deletions})\n"
        if patch:
            pr_content += f"```diff\n{patch}\n```\n"
    
    return pr_content


def summarize_pr_changes(pr_content: str) -> str:
    """Summarize PR changes using Claude in a separate conversation.
    
    Args:
        pr_content: The full PR content including title, description, and diffs.
    
    Returns:
        A concise summary of the PR changes suitable for context.
    """
    client = anthropic.Anthropic()
    
    summarization_prompt = """You are a technical writer summarizing a GitHub Pull Request for a demo presenter.

Your task is to create a concise but comprehensive summary that will help the presenter understand and demonstrate the changes. Focus on:
1. What feature or fix is being introduced
2. The key user-facing changes (what users will see/experience)
3. Any important technical details the presenter should know

Keep the summary to 2-3 paragraphs. Be specific about what changed and why it matters."""

    response = client.messages.create(
        model="claude-sonnet-4-5-20250929",
        max_tokens=1024,
        system=summarization_prompt,
        messages=[
            {
                "role": "user",
                "content": f"Please summarize this Pull Request:\n\n{pr_content}",
            }
        ],
    )
    
    # Extract text from response
    summary = ""
    for block in response.content:
        if hasattr(block, "text"):
            summary += block.text
    
    return summary


def speak(text: str) -> bool:
    """Speak text using ElevenLabs TTS.
    
    Returns True if completed normally, False if interrupted.
    """
    if not text:
        return True
    
    if is_interrupted():
        return False
    
    try:
        client = ElevenLabs()
        audio_generator = client.text_to_speech.convert(
            voice_id=ELEVENLABS_VOICE_ID,
            text=text,
            model_id="eleven_flash_v2_5",
        )
        
        # Collect audio bytes
        audio_bytes = b"".join(audio_generator)
        
        if is_interrupted():
            return False
        
        # Play audio using sounddevice
        # ElevenLabs returns MP3, need to decode it
        import subprocess

        # Use ffmpeg to convert MP3 to raw PCM
        process = subprocess.Popen(
            ["ffmpeg", "-i", "pipe:0", "-f", "s16le", "-ar", "24000", "-ac", "1", "pipe:1"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        pcm_data, _ = process.communicate(input=audio_bytes)
        
        # Convert to numpy array and play
        audio_array = np.frombuffer(pcm_data, dtype=np.int16)
        sd.play(audio_array, samplerate=24000)
        
        # Wait for playback with interrupt checking
        while sd.get_stream() and sd.get_stream().active:
            if is_interrupted():
                sd.stop()
                return False
            time.sleep(0.05)
        
        return True
        
    except Exception as e:
        print(f"  (TTS error: {e})")
        return True


def speak_async(text: str) -> None:
    """Speak text in a background thread."""
    thread = threading.Thread(target=speak, args=(text,), daemon=True)
    thread.start()


def record_audio() -> bytes:
    """Record audio from microphone until user presses Enter."""
    print("🎤 Recording... (press Enter to stop)")
    
    audio_chunks = []
    recording = True
    
    def callback(indata, frames, time, status):
        if recording:
            audio_chunks.append(indata.copy())
    
    # Start recording in a separate stream
    stream = sd.InputStream(
        samplerate=SAMPLE_RATE,
        channels=CHANNELS,
        dtype=np.int16,
        callback=callback,
    )
    
    with stream:
        input()  # Wait for Enter to stop
        recording = False
    
    if not audio_chunks:
        return b""
    
    # Concatenate audio chunks
    audio_data = np.concatenate(audio_chunks, axis=0)
    
    # Convert to WAV bytes
    wav_buffer = io.BytesIO()
    with wave.open(wav_buffer, "wb") as wav_file:
        wav_file.setnchannels(CHANNELS)
        wav_file.setsampwidth(2)  # 16-bit audio
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(audio_data.tobytes())
    
    return wav_buffer.getvalue()


def transcribe_audio(audio_bytes: bytes) -> str:
    """Transcribe audio using OpenAI Whisper API."""
    if not audio_bytes:
        return ""
    
    client = openai.OpenAI()
    
    # Save to temp file for API
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name
    
    try:
        with open(temp_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
            )
        return transcript.text.strip()
    finally:
        os.unlink(temp_path)


def get_voice_input() -> str:
    """Record and transcribe voice input."""
    audio_bytes = record_audio()
    if not audio_bytes:
        return ""
    
    print("📝 Transcribing...")
    text = transcribe_audio(audio_bytes)
    if text:
        print(f"   \"{text}\"")
    return text


def tool_action_description(tool_name: str, tool_input: dict) -> str:
    """Generate a human-readable description of a tool action."""
    if tool_name == "browser_navigate":
        return f"Navigating to {tool_input.get('url', 'page')}"
    elif tool_name == "browser_click":
        element = tool_input.get("element", tool_input.get("selector", "element"))
        return f"Clicking {element}"
    elif tool_name == "browser_type":
        return "Typing text"
    elif tool_name == "browser_scroll":
        direction = tool_input.get("direction", "down")
        return f"Scrolling {direction}"
    elif tool_name == "browser_snapshot":
        return "Taking a snapshot of the page"
    elif tool_name == "browser_screenshot":
        return "Taking a screenshot"
    else:
        return f"Performing {tool_name.replace('_', ' ')}"


async def run_agent(url: str, pr_summary: str, voice_mode: bool = False) -> None:
    """Launch browser via Playwright MCP and start interactive REPL."""
    # Construct system prompt with PR context
    system_prompt = SYSTEM_PROMPT + f"\n\n## Code Change Context\n{pr_summary}"
    
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
            if voice_mode:
                speak(f"Navigating to {url}")
            await session.call_tool("browser_navigate", {"url": url})

            if voice_mode:
                print("\n🎙️  Voice mode enabled!")
                print("Press Enter to start recording, then Enter again to stop.")
                print("Press Escape to interrupt the agent while it's talking or acting.")
                print("Type 'quit' or 'exit' to close.\n")
                speak("Ready! I'm listening for your commands.")
            else:
                print("\nReady! Type commands for the browser agent.")
                print("Press Escape to interrupt the agent while it's acting.")
                print("Type 'quit' or 'exit' to close.\n")

            client = anthropic.Anthropic()
            conversation_history = []

            while True:
                try:
                    if voice_mode:
                        print("> ", end="", flush=True)
                        typed = input().strip()
                        
                        # Allow typing quit/exit even in voice mode
                        if typed.lower() in ("quit", "exit"):
                            print("Closing browser...")
                            speak("Goodbye!")
                            break
                        
                        # If they typed something, use that; otherwise record voice
                        if typed:
                            user_input = typed
                        else:
                            user_input = get_voice_input()
                    else:
                        user_input = input("> ").strip()
                except EOFError:
                    break

                if not user_input:
                    continue

                if user_input.lower() in ("quit", "exit"):
                    print("Closing browser...")
                    if voice_mode:
                        speak("Goodbye!")
                    break

                # Add user message to history
                conversation_history.append({
                    "role": "user",
                    "content": user_input,
                })

                # Call Claude with tools
                try:
                    # Start keyboard listener for escape key during processing
                    start_keyboard_listener()
                    clear_interrupt()
                    interrupted = False
                    
                    response = client.messages.create(
                        model="claude-sonnet-4-5-20250929",
                        max_tokens=4096,
                        system=system_prompt,
                        tools=anthropic_tools,
                        messages=conversation_history,
                    )

                    # Process response
                    while response.stop_reason == "tool_use" and not interrupted:
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
                                # Check for interrupt before each tool
                                if is_interrupted():
                                    interrupted = True
                                    print("\n  ⚠️  Interrupted!")
                                    if voice_mode:
                                        print("  (Press Enter to give a new command)")
                                    # Add a result indicating interruption
                                    tool_results.append({
                                        "type": "tool_result",
                                        "tool_use_id": block.id,
                                        "content": "Action interrupted by user.",
                                    })
                                    continue
                                
                                tool_name = block.name
                                tool_input = block.input
                                print(f"  → {tool_name}: {json.dumps(tool_input)}")
                                
                                # Speak what we're doing
                                if voice_mode:
                                    action_desc = tool_action_description(tool_name, tool_input)
                                    if not speak(action_desc):
                                        # Speech was interrupted
                                        interrupted = True
                                        print("\n  ⚠️  Interrupted!")
                                        print("  (Press Enter to give a new command)")
                                        tool_results.append({
                                            "type": "tool_result",
                                            "tool_use_id": block.id,
                                            "content": "Action interrupted by user.",
                                        })
                                        continue

                                try:
                                    result = await session.call_tool(tool_name, tool_input)
                                    result_content = result.content[0].text if result.content else "OK"
                                except Exception as e:
                                    result_content = f"Error: {e}"

                                # Check for interrupt after tool execution
                                if is_interrupted():
                                    interrupted = True
                                    print("\n  ⚠️  Interrupted!")
                                    if voice_mode:
                                        print("  (Press Enter to give a new command)")

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

                        # If interrupted, don't continue the conversation loop
                        if interrupted:
                            break

                        # Continue conversation
                        response = client.messages.create(
                            model="claude-sonnet-4-5-20250929",
                            max_tokens=4096,
                            system=system_prompt,
                            tools=anthropic_tools,
                            messages=conversation_history,
                        )

                    # Print final text response (unless interrupted)
                    if not interrupted:
                        final_text = ""
                        for block in response.content:
                            if hasattr(block, "text"):
                                final_text += block.text

                        if final_text:
                            print(f"\n{final_text}\n")
                            if voice_mode:
                                speak(final_text)

                        conversation_history.append({
                            "role": "assistant",
                            "content": response.content,
                        })
                    
                    # Stop keyboard listener and clear interrupt for next iteration
                    stop_keyboard_listener()
                    clear_interrupt()

                except Exception as e:
                    stop_keyboard_listener()
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
    parser.add_argument(
        "pr_url",
        help="GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)"
    )
    parser.add_argument(
        "--voice", "-v",
        action="store_true",
        help="Enable voice mode (speech input/output, requires OPENAI_API_KEY and ELEVENLABS_API_KEY)"
    )
    args = parser.parse_args()

    try:
        # Fetch and summarize PR changes
        print(f"Fetching PR from {args.pr_url}...")
        pr_content = fetch_pr_diff(args.pr_url)
        
        print("Summarizing PR changes...")
        pr_summary = summarize_pr_changes(pr_content)
        print("PR context loaded.\n")
        
        asyncio.run(run_agent(args.url, pr_summary, voice_mode=args.voice))
    except KeyboardInterrupt:
        print("\nInterrupted. Closing...")
        sys.exit(0)


if __name__ == "__main__":
    main()
