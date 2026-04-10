"use client";

/**
 * 인증 상태 Context
 * - 로그인/로그아웃/현재 회원 정보를 전역 제공
 * - localStorage 기반 초기화 (클라이언트 전용)
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  clearToken,
  loadMember,
  loadToken,
  MemberInfo,
  saveMember,
  saveToken,
} from "./auth";

interface AuthContextValue {
  token: string | null;
  member: MemberInfo | null;
  loading: boolean;
  login: (token: string, member: MemberInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(loadToken());
    setMember(loadMember());
    setLoading(false);
  }, []);

  const login = (newToken: string, newMember: MemberInfo) => {
    saveToken(newToken);
    saveMember(newMember);
    setToken(newToken);
    setMember(newMember);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    setMember(null);
  };

  return (
    <AuthContext.Provider value={{ token, member, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
