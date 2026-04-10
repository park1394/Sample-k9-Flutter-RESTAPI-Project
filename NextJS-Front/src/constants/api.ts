/**
 * API Base URL
 *
 * 주의:
 * - 웹 브라우저 환경에서는 localhost / 실제 내부 사설 IP 만 유효.
 * - 10.0.2.2 는 Android 에뮬레이터 전용이므로 절대 사용 금지.
 * - 환경별 오버라이드는 .env.local 의 NEXT_PUBLIC_API_BASE_URL 로 수행.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
