import { KanbanBoard } from '@/components/KanbanBoard';

export const metadata = {
  title: 'Kanban Board MVP',
  description: 'A slick, professional, gorgeous Kanban Project Management application.',
};

export default function Home() {
  return (
    <main>
      <KanbanBoard />
    </main>
  );
}
