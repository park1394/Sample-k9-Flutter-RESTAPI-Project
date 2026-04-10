"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const { member, loading, logout } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">📚 부산도서관 관리 시스템</h1>
      <p className="text-gray-600">
        Next.js 웹 프론트엔드 — Spring Boot 백엔드 공유
      </p>

      {member ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-lg">
            환영합니다, <strong>{member.mname}</strong> 님
          </p>
          <div className="flex gap-3">
            <Link
              href="/books"
              className="rounded bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
            >
              도서 둘러보기
            </Link>
            <Link
              href="/mypage"
              className="rounded border border-brand-600 px-4 py-2 text-brand-600 hover:bg-brand-50"
            >
              마이페이지
            </Link>
            <button
              onClick={logout}
              className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded bg-brand-600 px-6 py-2 text-white hover:bg-brand-700"
          >
            로그인
          </Link>
          <Link
            href="/signup"
            className="rounded border border-brand-600 px-6 py-2 text-brand-600 hover:bg-brand-50"
          >
            회원가입
          </Link>
        </div>
      )}

      <footer className="mt-12 text-sm text-gray-400">
        기획 문서:{" "}
        <Link href="/PLAN.md" className="underline">
          PLAN.md
        </Link>
      </footer>
    </main>
  );
}
