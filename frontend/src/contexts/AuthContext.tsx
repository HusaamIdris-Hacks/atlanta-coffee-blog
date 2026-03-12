"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  changePassword as apiChangePassword,
  getMe,
  login as apiLogin,
  register as apiRegister,
  updateProfile as apiUpdateProfile,
  uploadAvatar as apiUploadAvatar,
} from "@/lib/api";
import type { User } from "@/lib/api";

const TOKEN_KEY = "beancompass_token";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; bio?: string; profile_ring_color?: string | null }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getLoadUserErrorMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  return msg === "Not authenticated" ? "Session expired" : "Network error";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadIdRef = useRef(0);

  const loadUser = useCallback(async (storedToken: string) => {
    const id = ++loadIdRef.current;
    try {
      const userData = await getMe(storedToken);
      if (id !== loadIdRef.current) return;
      setUser(userData);
      setToken(storedToken);
      setError(null);
    } catch (err) {
      if (id !== loadIdRef.current) return;
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
      setError(getLoadUserErrorMessage(err));
    } finally {
      if (id === loadIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (stored) {
      loadUser(stored);
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const { access_token } = await apiLogin(email, password);
        localStorage.setItem(TOKEN_KEY, access_token);
        await loadUser(access_token);
      } catch (err) {
        // Fallback to a generic message, or parse the API error if it has a specific shape
        const msg = err instanceof Error ? err.message : "Login failed";
        setError(msg);
        throw err; // Optional: re-throw if you STILL want the component to know it failed
      }
    },
    [loadUser]
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      setError(null);
      try {
        const { access_token } = await apiRegister(email, password, name);
        localStorage.setItem(TOKEN_KEY, access_token);
        await loadUser(access_token);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Registration failed";
        setError(msg);
        throw err; 
      }
    },
    [loadUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
    setLoading(false);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (stored) await loadUser(stored);
  }, [loadUser]);

  const updateProfile = useCallback(
    async (data: { name?: string; bio?: string; profile_ring_color?: string | null }) => {
      const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
      if (!stored) throw new Error("Not authenticated");
      const updated = await apiUpdateProfile(stored, data);
      setUser(updated);
    },
    []
  );

  const uploadAvatar = useCallback(async (file: File) => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) throw new Error("Not authenticated");
    const updated = await apiUploadAvatar(stored, file);
    setUser(updated);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
      if (!stored) throw new Error("Not authenticated");
      const { access_token } = await apiChangePassword(stored, currentPassword, newPassword);
      localStorage.setItem(TOKEN_KEY, access_token);
      await loadUser(access_token);
    },
    [loadUser]
  );

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    uploadAvatar,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
