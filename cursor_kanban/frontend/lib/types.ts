export type Column = {
  id: string;
  title: string;
};

export type Card = {
  id: string;
  columnId: string;
  title: string;
  details: string;
  order: number;
};
