import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { User } from "./api";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  signOut: () => void;
  isReady: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "token";
const USER_KEY = "user";

function loadStored(): { token: string | null; user: User | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      const user = JSON.parse(userJson) as User;
      return { token, user };
    }
  } catch {
    // ignore
  }
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(loadStored);
  const setAuth = useCallback((token: string, user: User) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setState({ token, user });
  }, []);
  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setState({ token: null, user: null });
  }, []);
  const value = useMemo(
    () => ({
      ...state,
      setAuth,
      signOut,
      isReady: true,
    }),
    [state.token, state.user, setAuth, signOut]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
