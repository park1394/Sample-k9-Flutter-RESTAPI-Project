"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, PageResponse } from "@/lib/api";
import { Book } from "@/types/book";

/**
 * 도서 목록 페이지 — 참고 구현
 *
 * GET /api/book/list?page=0&size=20 로 Spring Page<BookDTO> 를 가져와 표시합니다.
 * 실제 백엔드 엔드포인트/파라미터에 맞게 조정하세요.
 */
export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get<PageResponse<Book>>("/book/list", {
          params: { page: 0, size: 20 },
        });
        if (!mounted) return;
        setBooks(res.data.content ?? []);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "도서 목록을 불러오지 못했습니다.";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">📚 도서 목록</h1>
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          ← 홈
        </Link>
      </div>

      {loading && <p className="text-gray-500">로딩 중...</p>}
      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.length === 0 ? (
            <li className="col-span-full text-gray-500">
              등록된 도서가 없습니다.
            </li>
          ) : (
            books.map((book) => (
              <li
                key={book.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <Link href={`/books/${book.id}`} className="block">
                  <h2 className="truncate text-lg font-semibold">
                    {book.bookTitle}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">{book.author}</p>
                  {book.publisher && (
                    <p className="mt-1 text-xs text-gray-400">
                      {book.publisher}
                    </p>
                  )}
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </main>
  );
}
