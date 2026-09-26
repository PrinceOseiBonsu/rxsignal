import os
from typing import Any

import httpx

from models.drug import DrugLabel


OPENFDA_LABEL_URL = os.getenv(
    "OPENFDA_LABEL_URL",
    "https://api.fda.gov/drug/label.json",
)
OPENFDA_TIMEOUT_SECONDS = float(os.getenv("OPENFDA_TIMEOUT_SECONDS", "10"))
OPENFDA_RESULT_LIMIT = int(os.getenv("OPENFDA_RESULT_LIMIT", "10"))


class FDAServiceError(Exception):
    """Raised when openFDA cannot be reached or returns an unexpected response."""


class DrugNotFoundError(Exception):
    """Raised when openFDA has no matching label for the requested drug."""


class FDAService:
    def __init__(
        self,
        base_url: str = OPENFDA_LABEL_URL,
        timeout_seconds: float = OPENFDA_TIMEOUT_SECONDS,
    ) -> None:
        self.base_url = base_url
        self.timeout_seconds = timeout_seconds

    def get_drug_label(self, drug_name: str) -> DrugLabel:
        query = drug_name.strip()
        if not query:
            raise DrugNotFoundError("Drug name is required.")

        payload = self._fetch_label(query)
        results = payload.get("results", [])
        if not results:
            raise DrugNotFoundError(f"No FDA label found for '{drug_name}'.")

        return self._normalize_label(self._select_best_label(results, query))

    def _fetch_label(self, drug_name: str) -> dict[str, Any]:
        search = (
            f'openfda.generic_name:"{drug_name}" '
            f'OR openfda.brand_name:"{drug_name}"'
        )
        params = {"search": search, "limit": OPENFDA_RESULT_LIMIT}

        try:
            response = httpx.get(
                self.base_url,
                params=params,
                timeout=self.timeout_seconds,
            )
        except httpx.RequestError as exc:
            raise FDAServiceError("Unable to reach openFDA.") from exc

        if response.status_code == 404:
            raise DrugNotFoundError(f"No FDA label found for '{drug_name}'.")

        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise FDAServiceError(
                f"openFDA returned HTTP {response.status_code}."
            ) from exc

        try:
            return response.json()
        except ValueError as exc:
            raise FDAServiceError("openFDA returned invalid JSON.") from exc

    def _normalize_label(self, raw_label: dict[str, Any]) -> DrugLabel:
        openfda = raw_label.get("openfda") or {}

        return DrugLabel(
            generic_name=self._as_string_list(openfda.get("generic_name")),
            brand_name=self._as_string_list(openfda.get("brand_name")),
            manufacturer=self._as_string_list(openfda.get("manufacturer_name")),
            indications_and_usage=self._as_string_list(
                raw_label.get("indications_and_usage")
            ),
            warnings=self._as_string_list(raw_label.get("warnings")),
            boxed_warning=self._as_string_list(raw_label.get("boxed_warning")),
            contraindications=self._as_string_list(raw_label.get("contraindications")),
            adverse_reactions=self._as_string_list(raw_label.get("adverse_reactions")),
            effective_time=self._first_string(raw_label.get("effective_time")),
        )

    def _select_best_label(
        self,
        results: list[dict[str, Any]],
        drug_name: str,
    ) -> dict[str, Any]:
        normalized_query = drug_name.casefold()

        for result in results:
            openfda = result.get("openfda") or {}
            names = (
                self._as_string_list(openfda.get("generic_name"))
                + self._as_string_list(openfda.get("brand_name"))
            )
            if any(name.casefold() == normalized_query for name in names):
                return result

        return results[0]

    def _as_string_list(self, value: Any) -> list[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item) for item in value if item is not None]
        return [str(value)]

    def _first_string(self, value: Any) -> str | None:
        values = self._as_string_list(value)
        return values[0] if values else None
