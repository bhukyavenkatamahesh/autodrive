from fastapi import FastAPI

app = FastAPI(title="AutoDrive Price Prediction Service")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"service": "ml-price", "status": "ok"}

