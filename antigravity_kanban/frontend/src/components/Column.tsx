import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { CardType, ColumnType } from '../types';
import { Card } from './Card';
import styles from './Column.module.css';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  onRename: (columnId: string, newTitle: string) => void;
  onAddCard: (columnId: string, title: string, details: string) => void;
  onDeleteCard: (cardId: string) => void;
}

export const Column: React.FC<ColumnProps> = ({
  column,
  cards,
  onRename,
  onAddCard,
  onDeleteCard,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(column.title);
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDetails, setNewCardDetails] = useState('');

  const handleTitleSubmit = () => {
    if (titleValue.trim() && titleValue !== column.title) {
      onRename(column.id, titleValue.trim());
    } else {
      setTitleValue(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitleValue(column.title);
      setIsEditingTitle(false);
    }
  };

  const handleAddCardSubmit = () => {
    if (newCardTitle.trim()) {
      onAddCard(column.id, newCardTitle.trim(), newCardDetails.trim());
      setNewCardTitle('');
      setNewCardDetails('');
      setIsAddingCard(false);
    }
  };

  return (
    <div className={styles.column} data-testid={`column-${column.id}`}>
      <div className={styles.header}>
        <input
          type="text"
          value={titleValue}
          onChange={(e) => setTitleValue(e.target.value)}
          onBlur={handleTitleSubmit}
          onKeyDown={handleTitleKeyDown}
          className={styles.titleInput}
          aria-label={`Rename ${column.title} column`}
        />
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            className={`${styles.cardList} ${
              snapshot.isDraggingOver ? styles.isDraggingOver : ''
            }`}
            ref={provided.innerRef}
            {...provided.droppableProps}
            data-testid={`droppable-${column.id}`}
          >
            {cards.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                index={index}
                onDelete={onDeleteCard}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className={styles.footer}>
        {isAddingCard ? (
          <div className={styles.addCardContainer}>
            <input
              autoFocus
              type="text"
              placeholder="Card Title"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              className={styles.input}
            />
            <textarea
              placeholder="Card Details (optional)"
              value={newCardDetails}
              onChange={(e) => setNewCardDetails(e.target.value)}
              className={styles.textarea}
            />
            <div className={styles.buttonGroup}>
              <button
                className={styles.addButton}
                onClick={handleAddCardSubmit}
                disabled={!newCardTitle.trim()}
              >
                Add
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                  setNewCardDetails('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className={styles.newCardButton}
            onClick={() => setIsAddingCard(true)}
            data-testid={`add-card-btn-${column.id}`}
          >
            <Plus size={16} /> Add a card
          </button>
        )}
      </div>
    </div>
  );
};
