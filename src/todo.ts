export interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: number;
}

export class TodoStore {
  private todos: Todo[] = [];
  private nextId = 1;

  add(text: string): Todo {
    const todo: Todo = {
      id: this.nextId++,
      text: text.trim(),
      done: false,
      createdAt: Date.now(),
    };
    this.todos.push(todo);
    return todo;
  }

  list(): Todo[] {
    return [...this.todos];
  }

  complete(id: number): Todo | undefined {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) todo.done = true;
    return todo;
  }

  remove(id: number): boolean {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.todos.splice(index, 1);
    return true;
  }

  clear(): void {
    this.todos = [];
    this.nextId = 1;
  }
}

export function formatTodos(todos: Todo[]): string {
  if (todos.length === 0) return 'No todos yet. Add one with /add <text>.';
  return todos
    .map((t) => `${t.done ? '\u2705' : '\u2b1c'} ${t.id}. ${t.text}`)
    .join('\n');
}
