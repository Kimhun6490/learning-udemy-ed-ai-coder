import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Card } from '../Card';
import { CardType } from '../../types';

const mockCard: CardType = {
  id: 'card-1',
  title: 'Test Card Title',
  details: 'Test Card Details',
};

const renderWithDnd = (ui: React.ReactElement) => {
  return render(
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="test-droppable">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {ui}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

describe('Card Component', () => {
  it('renders card title and details', () => {
    renderWithDnd(<Card card={mockCard} index={0} onDelete={() => {}} />);
    
    expect(screen.getByText('Test Card Title')).toBeInTheDocument();
    expect(screen.getByText('Test Card Details')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', () => {
    const handleDelete = jest.fn();
    renderWithDnd(<Card card={mockCard} index={0} onDelete={handleDelete} />);
    
    const deleteButton = screen.getByTestId('delete-card-card-1');
    fireEvent.click(deleteButton);
    
    expect(handleDelete).toHaveBeenCalledWith('card-1');
  });
});
