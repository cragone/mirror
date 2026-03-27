import queue
import subprocess
import sys
import threading

_ttsQueue = queue.Queue()

_TTS_SCRIPT = """
import pyttsx3, sys
engine = pyttsx3.init()
engine.say(sys.argv[1])
engine.runAndWait()
"""


def _ttsWorker():
    while True:
        words = _ttsQueue.get()
        if words is None:
            break
        try:
            subprocess.run([sys.executable, "-c", _TTS_SCRIPT, words], timeout=15)
        except Exception as e:
            print(f"TTS error: {e}")


_ttsThread = threading.Thread(target=_ttsWorker, daemon=True)
_ttsThread.start()


def speak(words: str):
    _ttsQueue.put(words)
