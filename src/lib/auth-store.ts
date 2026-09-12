// Authentication store - manages user accounts and sessions
// User accounts are stored globally (not per-user) in localStorage

import { setCurrentUserId } from "./user-storage";

export interface AppUser {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  createdAt: string;
}

const USERS_KEY = "app_users";
const SESSION_KEY = "app_current_user";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Simple hash function (not cryptographically secure, but sufficient for client-side app)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_salt_baojia_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function getUsers(): AppUser[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveUsers(users: AppUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const authStore = {
  async register(username: string, password: string, displayName: string): Promise<{ success: boolean; error?: string; user?: AppUser }> {
    if (!username.trim()) return { success: false, error: "用户名不能为空" };
    if (password.length < 4) return { success: false, error: "密码至少4位" };
    if (!displayName.trim()) return { success: false, error: "显示名称不能为空" };

    const users = getUsers();
    if (users.some(u => u.username === username.trim())) {
      return { success: false, error: "用户名已存在" };
    }

    const passwordHash = await hashPassword(password);
    const newUser: AppUser = {
      id: generateId(),
      username: username.trim(),
      passwordHash,
      displayName: displayName.trim(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    // Auto login after registration
    localStorage.setItem(SESSION_KEY, newUser.id);
    setCurrentUserId(newUser.id);

    return { success: true, user: newUser };
  },

  async login(username: string, password: string): Promise<{ success: boolean; error?: string; user?: AppUser }> {
    const users = getUsers();
    const user = users.find(u => u.username === username.trim());
    if (!user) return { success: false, error: "用户名或密码错误" };

    const passwordHash = await hashPassword(password);
    if (user.passwordHash !== passwordHash) return { success: false, error: "用户名或密码错误" };

    localStorage.setItem(SESSION_KEY, user.id);
    setCurrentUserId(user.id);

    return { success: true, user };
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUserId(null);
  },

  getCurrentUser(): AppUser | null {
    if (typeof window === "undefined") return null;
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    const users = getUsers();
    return users.find(u => u.id === userId) || null;
  },

  getAllUsers(): AppUser[] {
    return getUsers();
  },
};
