import asyncio
import json
import os
import queue
import threading
from datetime import datetime, timedelta

import sounddevice as sd
from commands import getCommandFromText, getState, mirrorResponse, toggleCommand
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from voice import speak
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


def recognizerWorker():
    try:
        recognizer = KaldiRecognizer(model, SAMPLE_RATE)
        lastCommandTime = datetime.min
        COOL_DOWN = timedelta(seconds=2)

        with sd.RawInputStream(
            samplerate=SAMPLE_RATE,
            blocksize=BLOCKSIZE,
            device=1,
            dtype="int16",
            channels=CHANNELS,
            callback=audio_callback,
        ):
            print("Microphone listener started")
            while True:
                data = audio_queue.get()
                now = datetime.now()

                # Ignore all audio during cooldown
                if now - lastCommandTime < COOL_DOWN:
                    continue

                if recognizer.AcceptWaveform(data):
                    result = json.loads(recognizer.Result())
                    text = result.get("text", "").strip()
                    if not text or loop is None:
                        continue

                    command = getCommandFromText(text)
                    if command:
                        lastCommandTime = datetime.now()

                        toggleCommand(command)
                        asyncio.run_coroutine_threadsafe(
                            broadcast_json(
                                {
                                    "type": "state",
                                    "state": getState(),
                                }
                            ),
                            loop,
                        )
                        print(f"Command detected: {command}")
                        speak(mirrorResponse(command))

                        recognizer = KaldiRecognizer(model, SAMPLE_RATE)

                        while not audio_queue.empty():
                            try:
                                audio_queue.get_nowait()
                            except queue.Empty:
                                break
                else:
                    recognizer.PartialResult()
    except Exception as e:
        if loop is not None:
            asyncio.run_coroutine_threadsafe(
                broadcast_json({"type": "error", "message": str(e)}),
                loop,
            )


@app.on_event("startup")
async def startup_event():
    global loop
    loop = asyncio.get_running_loop()

    thread = threading.Thread(target=recognizerWorker, daemon=True)
    thread.start()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)

    try:
        await websocket.send_text(json.dumps({"type": "status", "text": "connected"}))
        await websocket.send_text(json.dumps({"type": "state", "state": getState()}))
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        connected_clients.discard(websocket)
        print("Client disconnected")
    except Exception as e:
        connected_clients.discard(websocket)
        print(f"Unexpected websocket error: {e}")
        raise
