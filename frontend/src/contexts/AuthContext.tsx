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
  getMe,
  getFavoriteCities,
  login as apiLogin,
  register as apiRegister,
  updateProfile as apiUpdateProfile,
  uploadAvatar as apiUploadAvatar,
} from "@/lib/api";
import type { FavoriteCity, User } from "@/lib/api";

const TOKEN_KEY = "beancompass_token";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  favoriteCities: FavoriteCity[];
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  reloadFavoriteCities: () => Promise<void>;
  updateProfile: (data: { name?: string; bio?: string; profile_ring_color?: string | null }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
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
  const [favoriteCities, setFavoriteCities] = useState<FavoriteCity[]>([]);
  const loadIdRef = useRef(0);

  const loadUser = useCallback(async (storedToken: string) => {
    const id = ++loadIdRef.current;
    try {
      // Fire both requests in parallel — cities arrive at zero extra cost.
      const [userData, cities] = await Promise.all([
        getMe(storedToken),
        getFavoriteCities(storedToken).catch(() => [] as FavoriteCity[]),
      ]);
      if (id !== loadIdRef.current) return;
      setUser(userData);
      setToken(storedToken);
      setFavoriteCities(cities);
      setError(null);
    } catch (err) {
      if (id !== loadIdRef.current) return;
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setToken(null);
      setFavoriteCities([]);
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
    setFavoriteCities([]);
    setLoading(false);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (stored) await loadUser(stored);
  }, [loadUser]);

  const reloadFavoriteCities = useCallback(async () => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) return;
    const list = await getFavoriteCities(stored).catch(() => [] as FavoriteCity[]);
    setFavoriteCities(list);
  }, []);

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

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    error,
    favoriteCities,
    login,
    register,
    logout,
    refreshUser,
    reloadFavoriteCities,
    updateProfile,
    uploadAvatar,
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
