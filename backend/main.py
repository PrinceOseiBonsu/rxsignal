from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.drug import DrugLabel
from services.fda_service import FDAService, FDAServiceError, DrugNotFoundError


app = FastAPI(title="RxSignal API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fda_service = FDAService()


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "RxSignal API"}


@app.get("/api/drugs/{drug_name}", response_model=DrugLabel)
def get_drug(drug_name: str) -> DrugLabel:
    try:
        return fda_service.get_drug_label(drug_name)
    except DrugNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except FDAServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
