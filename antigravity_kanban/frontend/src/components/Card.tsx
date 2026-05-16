import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Trash2 } from 'lucide-react';
import { CardType } from '../types';
import styles from './Card.module.css';

interface CardProps {
  card: CardType;
  index: number;
  onDelete: (cardId: string) => void;
}

export const Card: React.FC<CardProps> = ({ card, index, onDelete }) => {
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`${styles.card} ${snapshot.isDragging ? styles.isDragging : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-testid={`card-${card.id}`}
        >
          <div className={styles.accent} />
          <div className={styles.header}>
            <div className={styles.title}>{card.title}</div>
            <button
              className={styles.deleteButton}
              onClick={() => onDelete(card.id)}
              aria-label="Delete card"
              data-testid={`delete-card-${card.id}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
          <div className={styles.details}>{card.details}</div>
        </div>
      )}
    </Draggable>
  );
};
