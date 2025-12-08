import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ApiUser } from "../lib/api";
import * as api from "../lib/api";

type AuthContextValue = {
  user: ApiUser | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
  signup: (
    payload: { email: string; password: string; first_name: string; last_name: string; role: "bride" | "groom"; partner_email: string; partner_first_name: string; partner_last_name: string }
  ) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_KEY = "muse_access_token";
const USER_KEY = "muse_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedToken) setAccessToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persistAuth = useCallback((nextUser: ApiUser, token: string) => {
    setUser(nextUser);
    setAccessToken(token);
    localStorage.setItem(ACCESS_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const handleSignup = useCallback(
    async (payload: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      role: "bride" | "groom";
      partner_email: string;
      partner_first_name: string;
      partner_last_name: string;
    }) => {
      setError(null);
      const data = await api.signup(payload);
      persistAuth(data.user, data.access);
    },
    [persistAuth]
  );

  const handleLogin = useCallback(
    async (payload: { email: string; password: string }) => {
      setError(null);
      const data = await api.login(payload);
      persistAuth(data.user, data.access);
    },
    [persistAuth]
  );

  const handleLogout = useCallback(async () => {
    setError(null);
    await api.logout(accessToken);
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(USER_KEY);
  }, [accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      error,
      signup: handleSignup,
      login: handleLogin,
      logout: handleLogout,
    }),
    [user, accessToken, loading, error, handleSignup, handleLogin, handleLogout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
