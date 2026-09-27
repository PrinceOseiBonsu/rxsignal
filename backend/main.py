from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.models.alerts import AlertRecord, AlertsResponse
from backend.models.change import ChangeComparisonRequest, ChangeDetectionResult
from backend.models.drug import DrugLabel
from backend.models.history import HistoryResult, MonitoringResult
from backend.models.intelligence import IntelligenceBrief, IntelligenceEvidence
from backend.models.priority import PriorityResult
from backend.repositories import SnapshotRepositoryError, TigerSnapshotRepository
from backend.services.alert_service import AlertNotFoundError, AlertService
from backend.services.change_detector import ChangeDetector
from backend.services.fda_service import FDAService, FDAServiceError, DrugNotFoundError
from backend.services.intelligence_service import (
    IntelligenceConfigurationError,
    IntelligenceService,
    IntelligenceServiceError,
    IntelligenceValidationError,
)
from backend.services.monitoring_service import MonitoringService
from backend.services.priority_engine import PriorityEngine


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
change_detector = ChangeDetector()
priority_engine = PriorityEngine()
snapshot_repository = TigerSnapshotRepository()
monitoring_service = MonitoringService(
    fda_service=fda_service,
    repository=snapshot_repository,
    change_detector=change_detector,
    priority_engine=priority_engine,
)
intelligence_service = IntelligenceService()
alert_service = AlertService(snapshot_repository)


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


@app.post("/api/compare", response_model=ChangeDetectionResult)
def compare_drug_labels(request: ChangeComparisonRequest) -> ChangeDetectionResult:
    return change_detector.compare(request.old, request.new)


@app.post("/api/prioritize", response_model=PriorityResult)
def prioritize_drug_label_changes(request: ChangeComparisonRequest) -> PriorityResult:
    comparison = change_detector.compare(request.old, request.new)
    return priority_engine.prioritize(comparison)


@app.post("/api/monitor/{drug_name}", response_model=MonitoringResult)
def monitor_drug(drug_name: str) -> MonitoringResult:
    try:
        return monitoring_service.monitor_drug(drug_name)
    except DrugNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except FDAServiceError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SnapshotRepositoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/history/{drug_name}", response_model=HistoryResult)
def get_drug_history(drug_name: str) -> HistoryResult:
    try:
        return monitoring_service.get_history(drug_name)
    except SnapshotRepositoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/alerts", response_model=AlertsResponse)
def get_alerts() -> AlertsResponse:
    try:
        return alert_service.list_alerts()
    except SnapshotRepositoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.get("/api/alerts/{signal_id}", response_model=AlertRecord)
def get_alert(signal_id: int) -> AlertRecord:
    try:
        return alert_service.get_alert(signal_id)
    except AlertNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except SnapshotRepositoryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/api/intelligence", response_model=IntelligenceBrief)
def generate_intelligence_brief(
    evidence: IntelligenceEvidence,
) -> IntelligenceBrief:
    try:
        return intelligence_service.generate_brief(evidence)
    except IntelligenceConfigurationError as exc:
        raise HTTPException(
            status_code=500,
            detail="Intelligence service is not configured.",
        ) from exc
    except IntelligenceServiceError as exc:
        raise HTTPException(
            status_code=503,
            detail="Intelligence service is temporarily unavailable.",
        ) from exc
    except IntelligenceValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail="Intelligence service returned an invalid response.",
        ) from exc
