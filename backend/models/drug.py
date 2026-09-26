from pydantic import BaseModel, Field


class SourceMetadata(BaseModel):
    name: str = "FDA/openFDA"
    url: str = "https://api.fda.gov/drug/label.json"


class DrugLabel(BaseModel):
    generic_name: list[str] = Field(default_factory=list)
    brand_name: list[str] = Field(default_factory=list)
    manufacturer: list[str] = Field(default_factory=list)
    indications_and_usage: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    boxed_warning: list[str] = Field(default_factory=list)
    contraindications: list[str] = Field(default_factory=list)
    adverse_reactions: list[str] = Field(default_factory=list)
    effective_time: str | None = None
    source: SourceMetadata = Field(default_factory=SourceMetadata)
