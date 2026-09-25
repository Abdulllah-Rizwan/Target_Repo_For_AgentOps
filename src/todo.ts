/**
 * Minimal in-memory todo store shared by the Telegram bot handlers.
 *
 * Lists are kept per chat, so every conversation gets its own todos.
 * Nothing is persisted yet: restarting the process clears all lists.
 */

export interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: number;
}

export class TodoList {
  private readonly todos = new Map<number, Todo>();
  private nextId = 1;

  /** Adds a todo with the given text and returns the created item. */
  add(text: string): Todo {
    const trimmed = text.trim();
    if (!trimmed) {
      throw new Error('Todo text cannot be empty');
    }

    const todo: Todo = {
      id: this.nextId++,
      text: trimmed,
      done: false,
      createdAt: Date.now(),
    };

    this.todos.set(todo.id, todo);
    return todo;
  }

  /** Returns every todo in insertion order. */
  list(): Todo[] {
    return [...this.todos.values()];
  }

  get(id: number): Todo | undefined {
    return this.todos.get(id);
  }

  /** Flips the done flag of a todo, or returns undefined if it is unknown. */
  toggle(id: number): Todo | undefined {
    const todo = this.todos.get(id);
    if (!todo) {
      return undefined;
    }

    todo.done = !todo.done;
    return todo;
  }

  remove(id: number): boolean {
    return this.todos.delete(id);
  }

  /** Removes every todo and returns how many were deleted. */
  clear(): number {
    const count = this.todos.size;
    this.todos.clear();
    this.nextId = 1;
    return count;
  }

  get size(): number {
    return this.todos.size;
  }
}

const lists = new Map<number, TodoList>();

/** Returns (creating it on first use) the todo list belonging to a chat. */
export function getTodoList(chatId: number): TodoList {
  let list = lists.get(chatId);
  if (!list) {
    list = new TodoList();
    lists.set(chatId, list);
  }

  return list;
}
