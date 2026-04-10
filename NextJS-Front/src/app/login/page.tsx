"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { MemberInfo } from "@/lib/auth";

/**
 * 로그인 페이지
 *
 * Spring Boot MemberController 의 로그인 엔드포인트에 POST 합니다.
 * 응답에는 accessToken 및 회원 정보가 포함됩니다.
 * (실제 응답 필드명은 백엔드 구현에 따라 조정 필요)
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [mid, setMid] = useState("");
  const [mpw, setMpw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // TODO: 백엔드 실제 경로/필드명에 맞게 수정
      const res = await api.post<{
        accessToken: string;
        member: MemberInfo;
      }>("/member/login", { mid, mpw });

      const { accessToken, member } = res.data;
      if (!accessToken) {
        throw new Error("토큰을 받지 못했습니다.");
      }
      login(accessToken, member);
      router.push("/");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "로그인 중 오류가 발생했습니다.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-8 shadow"
      >
        <h1 className="mb-6 text-center text-2xl font-bold">로그인</h1>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            아이디
          </span>
          <input
            type="text"
            value={mid}
            onChange={(e) => setMid(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            비밀번호
          </span>
          <input
            type="password"
            value={mpw}
            onChange={(e) => setMpw(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </label>

        {error && (
          <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-brand-600 py-2 font-semibold text-white hover:bg-brand-700 disabled:bg-gray-400"
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>

        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <Link href="/" className="hover:underline">
            ← 홈으로
          </Link>
          <Link href="/signup" className="text-brand-600 hover:underline">
            회원가입
          </Link>
        </div>
      </form>
    </main>
  );
}
