import asyncio
import json
import os
import queue
import threading

import sounddevice as sd
from commands import get_command_from_text
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from vosk import KaldiRecognizer, Model

app = FastAPI()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "vosk-model-small-en-us-0.15")
model = Model(MODEL_PATH)

SAMPLE_RATE = 16000
CHANNELS = 1
BLOCKSIZE = 8000

audio_queue = queue.Queue()
connected_clients: set[WebSocket] = set()
loop = None


@app.get("/health")
def health():
    return {"status": "ok"}


def audio_callback(indata, frames, time, status):
    if status:
        print(f"Audio status: {status}")
    audio_queue.put(bytes(indata))


async def broadcast_json(payload: dict):
    dead = []

    for ws in connected_clients:
        try:
            await ws.send_text(json.dumps(payload))
        except Exception:
            dead.append(ws)

    for ws in dead:
        connected_clients.discard(ws)


def recognizer_worker():
    recognizer = KaldiRecognizer(model, SAMPLE_RATE)

    with sd.RawInputStream(
        samplerate=SAMPLE_RATE,
        blocksize=BLOCKSIZE,
        dtype="int16",
        channels=CHANNELS,
        callback=audio_callback,
    ):
        print("Microphone listener started")

        while True:
            data = audio_queue.get()

            if recognizer.AcceptWaveform(data):
                result = json.loads(recognizer.Result())
                text = result.get("text", "").strip()

                if not text or loop is None:
                    continue

                command = get_command_from_text(text)

                if command:
                    asyncio.run_coroutine_threadsafe(
                        broadcast_json(
                            {
                                "type": "command",
                                "command": command,
                            }
                        ),
                        loop,
                    )
                    print(f"Command detected: {command}")

            else:
                # Ignore partial speech completely
                recognizer.PartialResult()


@app.on_event("startup")
async def startup_event():
    global loop
    loop = asyncio.get_running_loop()

    thread = threading.Thread(target=recognizer_worker, daemon=True)
    thread.start()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)

    try:
        await websocket.send_text(
            json.dumps(
                {
                    "type": "status",
                    "text": "connected to local vosk listener",
                }
            )
        )

        while True:
            await asyncio.sleep(1)

    except WebSocketDisconnect:
        connected_clients.discard(websocket)
        print("Client disconnected")
    except Exception:
        connected_clients.discard(websocket)
        raise
