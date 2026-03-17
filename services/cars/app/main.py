from fastapi import FastAPI

app = FastAPI(title="AutoDrive Cars Service")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"service": "cars", "status": "ok"}

