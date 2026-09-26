from typing import Literal

from pydantic import BaseModel


PriorityLevel = Literal["low", "medium", "high"]


class PriorityResult(BaseModel):
    score: int
    priority: PriorityLevel
    reasons: list[str]
