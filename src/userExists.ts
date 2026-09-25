/**
 * Utility for verifying whether a user exists.
 *
 * NOTE: This is a stub and does NOT connect to a database.
 * The in-memory lookup below should be replaced with a real query
 * once persistence is wired up.
 */

export interface User {
  id: string;
  email?: string;
  username?: string;
}

// Placeholder store. Swap this out for a real DB client.
const users: User[] = [];

/**
 * Checks whether a user exists.
 *
 * @param userId - The id of the user to look up.
 * @returns True if the user exists, otherwise false.
 */
export function userExists(userId: string): boolean {
  if (!userId) {
    return false;
  }

  return users.some((user) => user.id === userId);
}
