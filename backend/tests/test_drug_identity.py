from backend.services.drug_identity import normalize_drug_key


def test_drug_key_normalization() -> None:
    assert normalize_drug_key("  Metoprolol   Tartrate  ") == "metoprolol tartrate"
