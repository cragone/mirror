import json
import os

from fastapi import FastAPI, WebSocket
from vosk import KaldiRecognizer, Model

app = FastAPI()

MODEL_PATH = os.path.join(os.path.dirname(__file__), "vosk-model-small-en-us-0.15")

model = Model(MODEL_PATH)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    while True:
        data = await websocket.receive_bytes()
        print(f"Received: {data}")

        await websocket.send_text(f"Echo: {data}")
