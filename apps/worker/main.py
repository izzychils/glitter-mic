"""Glitter Mic audio processing worker (placeholder).

Phase 9 fills in the pipeline from the build guide:
  1. Download + loudness-normalize the uploaded audio
  2. Demucs htdemucs -> vocal + instrumental stems (karaoke backing = instrumental)
  3. 50 Hz reference pitch contour from the vocal stem (librosa.pyin, fmin C2, fmax C6)
  4. Resemblyzer speaker embedding for the optional Voice Match metric
  5. Optional WhisperX forced alignment for word-level lyric timing
  6. Consume jobs from Redis (BullMQ-compatible) and report progress via pub/sub

For now this service only answers /health so the monorepo wiring is complete.
"""

from fastapi import FastAPI

app = FastAPI(title="Glitter Mic Worker", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "worker", "stage": "Phase 1 - scaffold"}
