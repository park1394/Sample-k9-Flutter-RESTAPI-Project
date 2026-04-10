/**
 * JWT 토큰 저장/로드 유틸리티
 *
 * 초기 구현은 localStorage 를 사용합니다. (XSS 방어를 위해 향후
 * httpOnly 쿠키 + Next.js Route Handler 중계로 마이그레이션 권장)
 *
 * 클라이언트 전용 — SSR 경로에서는 호출하지 마세요.
 */

const TOKEN_KEY = "accessToken";
const MEMBER_KEY = "memberInfo";

export interface MemberInfo {
  id: number;
  mid: string;
  mname: string;
  email?: string;
  role?: string;
}

export function saveToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function loadToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(MEMBER_KEY);
}

export function saveMember(member: MemberInfo): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
}

export function loadMember(): MemberInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(MEMBER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MemberInfo;
  } catch {
    return null;
  }
}
