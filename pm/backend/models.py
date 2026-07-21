from pydantic import BaseModel, Field, model_validator


class Card(BaseModel):
    id: str
    title: str
    details: str


class Column(BaseModel):
    id: str
    title: str
    cardIds: list[str]


class BoardData(BaseModel):
    columns: list[Column]
    cards: dict[str, Card]

    @model_validator(mode="after")
    def validate_card_refs(self):
        missing: list[str] = []
        for column in self.columns:
            for card_id in column.cardIds:
                if card_id not in self.cards:
                    missing.append(card_id)
        if missing:
            raise ValueError(f"Unknown card ids referenced in columns: {missing}")
        return self


class RenameColumnPayload(BaseModel):
    title: str = Field(min_length=1, max_length=120)


class AddCardPayload(BaseModel):
    columnId: str
    title: str = Field(min_length=1, max_length=200)
    details: str = ""


class UpdateCardPayload(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    details: str | None = None
    columnId: str | None = None
    position: int | None = None


class ReplaceBoardPayload(BaseModel):
    board: BoardData


class AiChatPayload(BaseModel):
    message: str = Field(min_length=1, max_length=5000)


class AiChatResult(BaseModel):
    assistantMessage: str
    boardUpdated: bool
