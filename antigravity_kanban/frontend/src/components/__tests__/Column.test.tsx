import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DragDropContext } from '@hello-pangea/dnd';
import { Column } from '../Column';
import { ColumnType, CardType } from '../../types';

const mockColumn: ColumnType = {
  id: 'col-1',
  title: 'Test Column',
  cardIds: ['card-1'],
};

const mockCards: CardType[] = [
  { id: 'card-1', title: 'Card 1', details: 'Details 1' },
];

const renderWithDnd = (ui: React.ReactElement) => {
  return render(
    <DragDropContext onDragEnd={() => {}}>
      {ui}
    </DragDropContext>
  );
};

describe('Column Component', () => {
  it('renders column title and cards', () => {
    renderWithDnd(
      <Column
        column={mockColumn}
        cards={mockCards}
        onRename={() => {}}
        onAddCard={() => {}}
        onDeleteCard={() => {}}
      />
    );

    expect(screen.getByDisplayValue('Test Column')).toBeInTheDocument();
    expect(screen.getByText('Card 1')).toBeInTheDocument();
  });

  it('allows renaming the column', () => {
    const handleRename = jest.fn();
    renderWithDnd(
      <Column
        column={mockColumn}
        cards={mockCards}
        onRename={handleRename}
        onAddCard={() => {}}
        onDeleteCard={() => {}}
      />
    );

    const input = screen.getByDisplayValue('Test Column');
    fireEvent.change(input, { target: { value: 'New Column Title' } });
    fireEvent.blur(input);

    expect(handleRename).toHaveBeenCalledWith('col-1', 'New Column Title');
  });

  it('allows adding a new card', () => {
    const handleAddCard = jest.fn();
    renderWithDnd(
      <Column
        column={mockColumn}
        cards={mockCards}
        onRename={() => {}}
        onAddCard={handleAddCard}
        onDeleteCard={() => {}}
      />
    );

    // Click "Add a card" button
    const addButton = screen.getByTestId('add-card-btn-col-1');
    fireEvent.click(addButton);

    // Fill in new card details
    const titleInput = screen.getByPlaceholderText('Card Title');
    const detailsInput = screen.getByPlaceholderText('Card Details (optional)');
    
    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(detailsInput, { target: { value: 'New Task Details' } });
    
    // Click Add
    const submitButton = screen.getByText('Add', { selector: 'button' });
    fireEvent.click(submitButton);

    expect(handleAddCard).toHaveBeenCalledWith('col-1', 'New Task', 'New Task Details');
  });
});
