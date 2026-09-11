// User-scoped localStorage wrapper
// Each user's data is stored under keys prefixed with their user ID

const SESSION_KEY = "current_user_id";

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function setCurrentUserId(userId: string | null): void {
  if (typeof window === "undefined") return;
  if (userId) {
    sessionStorage.setItem(SESSION_KEY, userId);
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

function userKey(key: string): string {
  const userId = getCurrentUserId();
  return userId ? `u_${userId}_${key}` : key;
}

export const userStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(userKey(key));
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(userKey(key), value);
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(userKey(key));
  },
};
