import os
import queue
import threading
import uuid

from gtts import gTTS


def talk(text: str, lang: str = "en", tld: str = "com"):
    base_dir = os.path.dirname(__file__)

    trash_dir = os.path.join(base_dir, "trash")

    os.makedirs(trash_dir, exist_ok=True)

    filename = os.path.join(trash_dir, "tts_{uuid.uuid4().hex}.mp3")

    tts = gTTS(text=text, lang=lang, tld=tld)
    tts.save(filename)
    os.startfile(filename)  # Windows only


_ttsQueue = queue.Queue()


def _ttsWorker():
    while True:
        words = _ttsQueue.get()
        if words is None:
            break
        try:
            talk(words)
        except Exception as e:
            print(f"TTS error: {e}")


_ttsThread = threading.Thread(target=_ttsWorker, daemon=True)
_ttsThread.start()
