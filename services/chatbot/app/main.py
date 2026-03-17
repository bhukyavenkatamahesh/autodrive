from fastapi import FastAPI

app = FastAPI(title="AutoDrive Chatbot Service")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"service": "chatbot", "status": "ok"}

