import { BoardData } from '../types';

export const initialData: BoardData = {
  cards: {
    'card-1': { id: 'card-1', title: 'Research competitors', details: 'Look at top 3 competitors and analyze their feature sets.' },
    'card-2': { id: 'card-2', title: 'Design system', details: 'Create color palette, typography scale, and core components.' },
    'card-3': { id: 'card-3', title: 'Set up Next.js', details: 'Initialize repository with App Router and testing tools.' },
    'card-4': { id: 'card-4', title: 'API Integration', details: 'Connect frontend with backend endpoints.' },
    'card-5': { id: 'card-5', title: 'Write tests', details: '100% coverage on core components.' },
  },
  columns: {
    'col-1': {
      id: 'col-1',
      title: 'Backlog',
      cardIds: ['card-1', 'card-2'],
    },
    'col-2': {
      id: 'col-2',
      title: 'To Do',
      cardIds: ['card-3'],
    },
    'col-3': {
      id: 'col-3',
      title: 'In Progress',
      cardIds: ['card-4'],
    },
    'col-4': {
      id: 'col-4',
      title: 'Review',
      cardIds: ['card-5'],
    },
    'col-5': {
      id: 'col-5',
      title: 'Done',
      cardIds: [],
    },
  },
  columnOrder: ['col-1', 'col-2', 'col-3', 'col-4', 'col-5'],
};
