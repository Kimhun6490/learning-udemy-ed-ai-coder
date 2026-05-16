'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { initialData } from '../data/dummy-data';
import { Column } from './Column';
import styles from './KanbanBoard.module.css';
import { BoardData } from '../types';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const KanbanBoard: React.FC = () => {
  const [data, setData] = useState<BoardData | null>(null);

  useEffect(() => {
    // Next.js Hydration issue workaround with dnd
    // We only set the data once the component is mounted on the client
    setData(initialData);
  }, []);

  if (!data) {
    return null; // Or a loading spinner
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startColumn = data.columns[source.droppableId];
    const finishColumn = data.columns[destination.droppableId];

    // Moving within the same column
    if (startColumn === finishColumn) {
      const newCardIds = Array.from(startColumn.cardIds);
      newCardIds.splice(source.index, 1);
      newCardIds.splice(destination.index, 0, draggableId);

      const newColumn = {
        ...startColumn,
        cardIds: newCardIds,
      };

      setData({
        ...data,
        columns: {
          ...data.columns,
          [newColumn.id]: newColumn,
        },
      });
      return;
    }

    // Moving from one column to another
    const startCardIds = Array.from(startColumn.cardIds);
    startCardIds.splice(source.index, 1);
    const newStart = {
      ...startColumn,
      cardIds: startCardIds,
    };

    const finishCardIds = Array.from(finishColumn.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finishColumn,
      cardIds: finishCardIds,
    };

    setData({
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    });
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    setData({
      ...data,
      columns: {
        ...data.columns,
        [columnId]: {
          ...data.columns[columnId],
          title: newTitle,
        },
      },
    });
  };

  const handleAddCard = (columnId: string, title: string, details: string) => {
    const newCardId = `card-${generateId()}`;
    const newCard = { id: newCardId, title, details };

    setData({
      ...data,
      cards: {
        ...data.cards,
        [newCardId]: newCard,
      },
      columns: {
        ...data.columns,
        [columnId]: {
          ...data.columns[columnId],
          cardIds: [...data.columns[columnId].cardIds, newCardId],
        },
      },
    });
  };

  const handleDeleteCard = (cardId: string) => {
    const newCards = { ...data.cards };
    delete newCards[cardId];

    const newColumns = { ...data.columns };
    for (const columnId in newColumns) {
      newColumns[columnId] = {
        ...newColumns[columnId],
        cardIds: newColumns[columnId].cardIds.filter((id) => id !== cardId),
      };
    }

    setData({
      ...data,
      cards: newCards,
      columns: newColumns,
    });
  };

  return (
    <div className={styles.boardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Project Alpha</h1>
        <p className={styles.subtitle}>Manage your tasks effectively.</p>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.board}>
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const cards = column.cardIds.map((cardId) => data.cards[cardId]);

            return (
              <Column
                key={column.id}
                column={column}
                cards={cards}
                onRename={handleRenameColumn}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
