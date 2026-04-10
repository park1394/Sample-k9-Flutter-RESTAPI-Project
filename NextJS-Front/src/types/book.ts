/**
 * Spring Boot BookDTO 대응 타입
 * 실제 필드는 백엔드 BookDTO 와 1:1 매칭되어야 합니다.
 */
export interface Book {
  id: number;
  bookTitle: string;
  author: string;
  publisher?: string;
  isbn?: string;
  category?: string;
  stock?: number;
  description?: string;
  bookImage?: string;
  regDate?: string;
  modDate?: string;
}
