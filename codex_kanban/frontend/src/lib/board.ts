export type Card = {
  id: string;
  title: string;
  details: string;
};

export type Column = {
  id: string;
  title: string;
  cards: Card[];
};

export type Board = Column[];

export const initialBoard: Board = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      {
        id: "card-brief",
        title: "Draft project brief",
        details: "Shape the first MVP notes into a clear build checklist.",
      },
      {
        id: "card-research",
        title: "Review customer notes",
        details: "Pull out the top requests from recent stakeholder feedback.",
      },
    ],
  },
  {
    id: "ready",
    title: "Ready",
    cards: [
      {
        id: "card-wireframe",
        title: "Sketch board layout",
        details: "Define the column rhythm and card density for launch.",
      },
    ],
  },
  {
    id: "progress",
    title: "In Progress",
    cards: [
      {
        id: "card-ui",
        title: "Polish visual system",
        details: "Apply color, spacing, and interaction states across the board.",
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [
      {
        id: "card-qa",
        title: "Run acceptance pass",
        details: "Check the core add, delete, rename, and move flows.",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      {
        id: "card-kickoff",
        title: "Kickoff notes captured",
        details: "Initial scope and constraints are documented.",
      },
    ],
  },
];

export function addCard(
  board: Board,
  columnId: string,
  title: string,
  details: string,
): Board {
  const newCard: Card = {
    id: `card-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: title.trim(),
    details: details.trim(),
  };

  return board.map((column) =>
    column.id === columnId
      ? { ...column, cards: [...column.cards, newCard] }
      : column,
  );
}

export function deleteCard(board: Board, cardId: string): Board {
  return board.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== cardId),
  }));
}

export function renameColumn(
  board: Board,
  columnId: string,
  title: string,
): Board {
  return board.map((column) =>
    column.id === columnId ? { ...column, title } : column,
  );
}

export function moveCard(board: Board, activeId: string, overId: string): Board {
  if (activeId === overId) {
    return board;
  }

  const sourceColumn = board.find((column) =>
    column.cards.some((card) => card.id === activeId),
  );
  const activeCard = sourceColumn?.cards.find((card) => card.id === activeId);

  if (!sourceColumn || !activeCard) {
    return board;
  }

  const overColumn =
    board.find((column) => column.id === overId) ??
    board.find((column) => column.cards.some((card) => card.id === overId));

  if (!overColumn) {
    return board;
  }

  return board.map((column) => {
    const withoutActive = column.cards.filter((card) => card.id !== activeId);

    if (column.id !== overColumn.id) {
      return column.id === sourceColumn.id
        ? { ...column, cards: withoutActive }
        : column;
    }

    if (overId === overColumn.id) {
      return { ...column, cards: [...withoutActive, activeCard] };
    }

    const overIndex = withoutActive.findIndex((card) => card.id === overId);
    const insertIndex = overIndex === -1 ? withoutActive.length : overIndex;
    const cards = [...withoutActive];
    cards.splice(insertIndex, 0, activeCard);

    return { ...column, cards };
  });
}
