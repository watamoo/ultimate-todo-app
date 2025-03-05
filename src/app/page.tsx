import { ThemeToggle } from '@/components/theme-toggle';
import { TodoContainer } from '@/components/todo/todo-container';

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">究極のTodoアプリ</h1>
        <ThemeToggle />
      </div>
      
      <TodoContainer />
    </main>
  );
}
