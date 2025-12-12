"""CLI entry point for the browser agent using Playwright MCP."""

import argparse
import asyncio
import io
import json
import os
import sys
import tempfile
import threading
import wave

import anthropic
import numpy as np
import openai
import sounddevice as sd
from elevenlabs import ElevenLabs
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Audio settings
SAMPLE_RATE = 16000
CHANNELS = 1

# ElevenLabs settings
ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # George - natural conversational voice


def speak(text: str) -> None:
    """Speak text using ElevenLabs TTS."""
    if not text:
        return
    
    try:
        client = ElevenLabs()
        audio_generator = client.text_to_speech.convert(
            voice_id=ELEVENLABS_VOICE_ID,
            text=text,
            model_id="eleven_flash_v2_5",
        )
        
        # Collect audio bytes
        audio_bytes = b"".join(audio_generator)
        
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
        sd.wait()
        
    except Exception as e:
        print(f"  (TTS error: {e})")


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


async def run_agent(url: str, voice_mode: bool = False) -> None:
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
            if voice_mode:
                speak(f"Navigating to {url}")
            await session.call_tool("browser_navigate", {"url": url})

            if voice_mode:
                print("\n🎙️  Voice mode enabled!")
                print("Press Enter to start recording, then Enter again to stop.")
                print("Type 'quit' or 'exit' to close.\n")
                speak("Ready! I'm listening for your commands.")
            else:
                print("\nReady! Type commands for the browser agent.")
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
                                
                                # Speak what we're doing
                                if voice_mode:
                                    action_desc = tool_action_description(tool_name, tool_input)
                                    speak(action_desc)

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
                        if voice_mode:
                            speak(final_text)

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
    parser.add_argument(
        "--voice", "-v",
        action="store_true",
        help="Enable voice mode (speech input/output, requires OPENAI_API_KEY and ELEVENLABS_API_KEY)"
    )
    args = parser.parse_args()

    try:
        asyncio.run(run_agent(args.url, voice_mode=args.voice))
    except KeyboardInterrupt:
        print("\nInterrupted. Closing...")
        sys.exit(0)


if __name__ == "__main__":
    main()
