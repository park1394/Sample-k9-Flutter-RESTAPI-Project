/**
 * axios 인스턴스 + JWT 인터셉터
 *
 * - 요청 시 localStorage 의 accessToken 을 Authorization 헤더에 자동 주입
 * - 401 응답 시 토큰 정리 후 /login 으로 리다이렉트
 */
import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "@/constants/api";
import { clearToken, loadToken } from "./auth";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = loadToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      clearToken();
      // 로그인 페이지가 아니면 리다이렉트
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

/** Spring Page<T> 공통 타입 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
