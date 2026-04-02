import asyncio
import json
import threading
from contextlib import asynccontextmanager

# from commands import getState
# from ears import recognizer_worker
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

# connected_clients: set[WebSocket] = set()
# loop = None


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     global loop
#     loop = asyncio.get_running_loop()

#     thread = threading.Thread(
#         target=recognizer_worker,
#         args=(loop, broadcast_json),
#         daemon=True,
#     )
#     thread.start()

#     yield


# app = FastAPI(lifespan=lifespan)
app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


# async def broadcast_json(payload: dict):
#     dead = []
#
#     for ws in connected_clients:
#         try:
#             await ws.send_text(json.dumps(payload))
#         except Exception:
#             dead.append(ws)
#
#     for ws in dead:
#         connected_clients.discard(ws)


# @app.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
#     connected_clients.add(websocket)
#
#     try:
#         await websocket.send_text(json.dumps({"type": "status", "text": "connected"}))
#         await websocket.send_text(json.dumps({"type": "state", "state": getState()}))
#
#         while True:
#             await websocket.receive_text()
#
#     except WebSocketDisconnect:
#         connected_clients.discard(websocket)
#         print("Client disconnected")
#     except Exception as e:
#         connected_clients.discard(websocket)
#         print(f"Unexpected websocket error: {e}")
#         raise
