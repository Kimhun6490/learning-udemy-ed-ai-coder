export type Id = string;

export interface CardType {
  id: Id;
  title: string;
  details: string;
}

export interface ColumnType {
  id: Id;
  title: string;
  cardIds: Id[];
}

export interface BoardData {
  cards: Record<Id, CardType>;
  columns: Record<Id, ColumnType>;
  columnOrder: Id[];
}
