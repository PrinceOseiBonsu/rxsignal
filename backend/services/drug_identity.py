import re


def normalize_drug_key(drug_name: str) -> str:
    """Prototype drug identity: lowercase, trim, and collapse whitespace."""

    return re.sub(r"\s+", " ", drug_name.strip().lower())
