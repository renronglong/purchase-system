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
  // 当前账号未确定时（例如新标签页 sessionStorage 丢失）绝不能退化成裸键：
  // 裸键会被当成「旧版存量数据」，在新账号首次登录时被迁移进别的账号。
  return userId ? `u_${userId}_${key}` : `anon_${key}`;
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
