export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  createdAt: string;
}

export interface DaySummary {
  date: string;
  total: number;
  entries: FoodEntry[];
}

// Rough calorie values per serving for common foods. Used when the user
// types a plain food name instead of an explicit number.
const COMMON_FOODS: Record<string, number> = {
  apple: 95,
  banana: 105,
  egg: 78,
  rice: 205,
  bread: 80,
  chicken: 165,
  salmon: 208,
  salad: 150,
  pizza: 285,
  milk: 103,
  coffee: 5,
  tea: 2,
  yogurt: 100,
  pasta: 220,
  cheese: 110,
  potato: 160,
  oats: 150,
  almonds: 164,
};

const entries: FoodEntry[] = [];

function dateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function nextId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function lookupCalories(name: string): number | undefined {
  return COMMON_FOODS[name.trim().toLowerCase()];
}

export function addEntry(name: string, calories: number): FoodEntry {
  const entry: FoodEntry = {
    id: nextId(),
    name: name.trim(),
    calories: Math.round(calories),
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  return entry;
}

export function addNamedEntry(name: string): FoodEntry | undefined {
  const calories = lookupCalories(name);
  if (calories === undefined) {
    return undefined;
  }
  return addEntry(name, calories);
}

export function getEntries(date = new Date()): FoodEntry[] {
  const key = dateKey(date);
  return entries.filter((entry) => entry.createdAt.slice(0, 10) === key);
}

export function getSummary(date = new Date()): DaySummary {
  const dayEntries = getEntries(date);
  return {
    date: dateKey(date),
    total: dayEntries.reduce((sum, entry) => sum + entry.calories, 0),
    entries: dayEntries,
  };
}

export function removeEntry(id: string): boolean {
  const index = entries.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return false;
  }
  entries.splice(index, 1);
  return true;
}

export function clearEntries(): void {
  entries.length = 0;
}
