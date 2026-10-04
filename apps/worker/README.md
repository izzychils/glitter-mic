# Glitter Mic Worker (placeholder)

Python FastAPI service that will process uploaded/public songs in Phase 9:

1. Download + loudness-normalize audio
2. **Demucs htdemucs** stem separation (vocals / instrumental)
3. 50 Hz reference pitch contour from the vocal stem (`librosa.pyin`, C2-C6)
4. **Resemblyzer** speaker embedding for the optional Voice Match metric
5. Optional **WhisperX** forced alignment for word-level lyric timing
6. BullMQ-compatible Redis job consumption with progress reporting

## Run (dev)

```bash
python -m venv .venv
. .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Health check: `GET http://localhost:8000/health`
