import asyncio
import json
import os
import queue
from datetime import datetime, timedelta

import sounddevice as sd
from commands import (
    SPEAK_PORTGUESE,
    command_state,
    getCommandFromText,
    getIntentFromText,
    getState,
    isTalkingToMirror,
    mirrorResponse,
    toggleCommand,
)
from voice import talk
from vosk import KaldiRecognizer, Model

SAMPLE_RATE = 16000
CHANNELS = 1
BLOCKSIZE = 8000

audio_queue = queue.Queue()


def get_model_paths():
    base_dir = os.path.dirname(os.path.abspath(__file__))

    return {
        "en": os.path.join(base_dir, "vosk-model-small-en-us-0.15"),
        "pt": os.path.join(base_dir, "vosk-model-small-pt-0.3"),
    }


def load_models():
    paths = get_model_paths()

    models = {}

    for lang, path in paths.items():
        if not os.path.isdir(path):
            raise FileNotFoundError(f"Missing Vosk model: {path}")

        print(f"Loading {lang} model from: {path}")
        models[lang] = Model(path)

    return models


def audio_callback(indata, frames, time, status):
    if status:
        print(f"Audio status: {status}")
    audio_queue.put(bytes(indata))


def recognizer_worker(loop, broadcast_json):
    try:
        models = load_models()

        current_lang = "pt" if command_state[SPEAK_PORTGUESE] else "en"
        recognizer = KaldiRecognizer(models[current_lang], SAMPLE_RATE)

        last_command_time = datetime.min
        cool_down = timedelta(seconds=2)

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

                # cooldown
                if now - last_command_time < cool_down:
                    continue

                # 🔥 detect language switch
                desired_lang = "pt" if command_state[SPEAK_PORTGUESE] else "en"
                if desired_lang != current_lang:
                    print(f"Switching model → {desired_lang}")
                    current_lang = desired_lang
                    recognizer = KaldiRecognizer(models[current_lang], SAMPLE_RATE)

                    # flush audio buffer so old language doesn't interfere
                    while not audio_queue.empty():
                        try:
                            audio_queue.get_nowait()
                        except queue.Empty:
                            break

                    continue

                if recognizer.AcceptWaveform(data):
                    result = json.loads(recognizer.Result())
                    text = result.get("text", "").strip()

                    if not text or loop is None:
                        continue

                    if not isTalkingToMirror(text):
                        return
                    command = getCommandFromText(text)
                    intent = getIntentFromText(text)
                    if command:
                        last_command_time = datetime.now()

                        toggleCommand(command, intent)

                        asyncio.run_coroutine_threadsafe(
                            broadcast_json(
                                {
                                    "type": "state",
                                    "state": getState(),
                                }
                            ),
                            loop,
                        )

                        print(f"[{current_lang}] Command detected: {command}")

                        if command_state[SPEAK_PORTGUESE]:
                            talk(mirrorResponse(command, "br"), "pt", "com.br")
                        else:
                            talk(mirrorResponse(command, "en"), "en", "com")

                        # reset recognizer after command
                        recognizer = KaldiRecognizer(models[current_lang], SAMPLE_RATE)

                        # flush queue
                        while not audio_queue.empty():
                            try:
                                audio_queue.get_nowait()
                            except queue.Empty:
                                break
                else:
                    recognizer.PartialResult()

    except Exception as e:
        print(f"Recognizer error: {e}")
        if loop is not None:
            asyncio.run_coroutine_threadsafe(
                broadcast_json({"type": "error", "message": str(e)}),
                loop,
            )
