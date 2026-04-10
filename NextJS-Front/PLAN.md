# NextJS-Front 기획서 & 작업 체크리스트

> 기존 Flutter + Spring Boot 연결 기능을 **웹(Next.js)** 으로 포팅하기 위한 기획/설계/체크리스트 문서.
> Flutter 앱과 **동일한 Spring Boot 백엔드**(`/api`)를 공유하며 UI/클라이언트만 Next.js 로 재구현합니다.

---

## 1. 목표

- 기존 Flutter 앱에서 제공하는 모든 사용자/관리자 기능을 **웹 브라우저**에서도 사용할 수 있게 한다.
- 백엔드 Spring Boot API(`api5012`)는 **수정하지 않는다** — CORS 만 필요에 따라 점검.
- Flutter 앱과 Next.js 웹은 **동일한 JWT 인증 체계**를 공유한다.
- 점진적 포팅: 핵심 기능(로그인, 도서, 마이페이지) → 보조 기능(공지/문의/행사) → 관리자 기능.

---

## 2. 기술 스택

| 영역 | 선택 | 근거 |
|---|---|---|
| 프레임워크 | **Next.js 15 (App Router)** | 최신 RSC 지원, 라우팅 간결 |
| 언어 | **TypeScript** | 타입 안정성, DTO 매핑 용이 |
| 스타일 | **Tailwind CSS** | 빠른 프로토타이핑, 유지보수 용이 |
| HTTP 클라이언트 | **axios** | 인터셉터로 JWT 헤더 주입 |
| 상태 관리 | **React Context + Zustand (경량)** | 인증/전역 상태 간단 처리 |
| 폼 | **react-hook-form + zod** | 유효성 검증 표준 |
| 아이콘 | **lucide-react** | 가벼운 SVG 아이콘 |
| 토큰 저장 | **httpOnly 쿠키 (권장) 또는 localStorage** | XSS 고려 — 초기엔 localStorage, 점진 마이그레이션 |

---

## 3. 백엔드 API 재사용 목록

Spring Boot 가 노출하는 `/api/**` 엔드포인트를 그대로 사용합니다.

| 도메인 | 컨트롤러 | 주요 엔드포인트 |
|---|---|---|
| 인증/회원 | `MemberController` | POST `/api/member/login`, POST `/api/member/signup`, GET `/api/member/me`, PUT `/api/member/update` |
| 도서 | `BookController` | GET `/api/book/list`, GET `/api/book/{id}`, POST/PUT/DELETE (관리자) |
| 대여 | `RentalController` | POST `/api/rental/rent`, GET `/api/rental/my`, POST `/api/rental/return/{id}` |
| 공지 | `NoticeController` | GET `/api/notice/list`, GET `/api/notice/{id}`, POST/PUT/DELETE (관리자) |
| 문의 | `InquiryController` | GET `/api/inquiry/list`, POST `/api/inquiry`, POST `/api/inquiry/{id}/reply` |
| 행사 | `EventController` | GET `/api/event/list`, POST `/api/event/{id}/apply` |
| 시설예약 | `ApplyController` | GET `/api/apply`, POST `/api/apply` |
| 희망도서 | `WishBookController` | POST `/api/wishbook`, GET `/api/wishbook/my` |
| AI | `ai/*` | (Flask 연동 예측 API) |

> 정확한 시그니처는 `Spring-Back/.../controller/` 의 실제 소스에서 확인.

---

## 4. 화면 매핑 (Flutter → Next.js)

| Flutter 화면 | Next.js 라우트 | 우선순위 |
|---|---|---|
| `login_screen.dart` | `/login` | P0 |
| `signup_screen.dart` | `/signup` | P0 |
| `my_splash.dart` | `/` (랜딩) | P0 |
| `tab/*` (메인 탭) | `/` 대시보드 레이아웃 | P0 |
| `book/book_list_screen.dart` | `/books` | P1 |
| `book/book_detail_screen.dart` | `/books/[id]` | P1 |
| `mypage/mypage_screen.dart` | `/mypage` | P1 |
| `rental/*` | `/mypage/rentals` | P1 |
| `notice/*` | `/notices`, `/notices/[id]` | P2 |
| `inquiry/*` | `/inquiries`, `/inquiries/new` | P2 |
| `event/*` | `/events`, `/events/[id]` | P2 |
| `reserve/*` | `/reserve` (시설예약) | P2 |
| `admin/admin_dashboard_screen.dart` | `/admin` | P3 |
| `admin/admin_book_screen.dart` | `/admin/books` | P3 |
| `admin/admin_event_screen.dart` | `/admin/events` | P3 |
| `admin/admin_facility_screen.dart` | `/admin/facility` | P3 |
| `admin/admin_inquiry_screen.dart` | `/admin/inquiries` | P3 |
| `admin/admin_member_screen.dart` | `/admin/members` | P3 |
| `admin/admin_notice_screen.dart` | `/admin/notices` | P3 |
| `ai/*` | `/ai` | P4 |

우선순위 기호: **P0**(필수 기반) → **P4**(보조)

---

## 5. 폴더 구조 (Next.js 15 App Router)

```
NextJS-Front/
├── PLAN.md                    # 본 문서
├── README.md                  # 실행/설정 가이드
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.local.example         # 환경변수 템플릿
├── .gitignore
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx         # 루트 레이아웃 (AuthProvider)
    │   ├── page.tsx           # 홈 / 랜딩
    │   ├── globals.css        # Tailwind 엔트리
    │   ├── login/page.tsx
    │   ├── signup/page.tsx
    │   ├── books/
    │   │   ├── page.tsx       # 도서 목록
    │   │   └── [id]/page.tsx  # 도서 상세
    │   ├── notices/...
    │   ├── events/...
    │   ├── mypage/...
    │   └── admin/...
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Protected.tsx      # 인증 가드
    │   └── ui/                # 재사용 UI
    ├── lib/
    │   ├── api.ts             # axios 인스턴스 + 인터셉터
    │   ├── auth.ts            # 토큰 저장/로드
    │   └── auth-context.tsx   # React Context
    ├── constants/
    │   └── api.ts             # API Base URL
    └── types/
        ├── member.ts
        ├── book.ts
        └── ...
```

---

## 6. 환경 설정

### 6-1. API Base URL

`.env.local` (gitignore 대상):
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

- **브라우저**에서 실행되므로 `10.0.2.2` (안드로이드 에뮬레이터 전용) 나 `192.168.x.x` 가 아닌 **`localhost`** 또는 **실제 배포 도메인**을 사용합니다.
- 모바일 브라우저 테스트 시: 호스트 PC 의 내부 사설 IP(예: `http://192.168.0.12:8080/api`) 사용, 동일 Wi-Fi + 방화벽 8080 허용 (상세는 루트 [SETUP.md](../SETUP.md) 참고).

### 6-2. Spring Boot CORS

[`CustomSecurityConfig.java`](../Spring-Back/SpringBasic/api5012/src/main/java/com/busanit501/api5012/config/CustomSecurityConfig.java) 에서 Next.js dev 포트(`http://localhost:3000`) 가 CORS Origin 에 포함되어 있는지 확인.

---

## 7. 작업 체크리스트 (Phase 별)

### Phase 0 — 프로젝트 기반 셋업
- [x] `NextJS-Front/` 폴더 생성
- [x] `PLAN.md` 작성
- [x] `README.md` 작성 (실행 명령어 포함)
- [x] `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs` 스캐폴딩
- [x] `.env.local.example` + `.gitignore`
- [x] `src/app/layout.tsx`, `globals.css` 루트 레이아웃
- [x] `src/lib/api.ts` — axios 인스턴스 + JWT 인터셉터
- [x] `src/lib/auth.ts` — 토큰 저장/로드
- [x] `src/lib/auth-context.tsx` — 인증 Context
- [x] `src/constants/api.ts` — Base URL 상수
- [ ] `npm install` 및 `npm run dev` 검증 (사용자 로컬에서 실행)

### Phase 1 — 인증 & 홈 (P0)
- [x] `/login` 페이지 (로그인 폼, JWT 수신/저장)
- [ ] `/signup` 페이지
- [x] 루트 `/` — 로그인 상태/비로그인 분기 랜딩
- [ ] Navbar 공통 컴포넌트 (로그인/로그아웃 토글)
- [ ] `Protected.tsx` 인증 가드 컴포넌트
- [ ] JWT 만료 시 자동 로그아웃 / 리다이렉트

### Phase 2 — 도서 / 마이페이지 (P1)
- [x] `/books` 도서 목록 (검색, 페이지네이션)
- [ ] `/books/[id]` 도서 상세
- [ ] 대여 신청 / 반납 플로우
- [ ] `/mypage` 내 정보
- [ ] `/mypage/rentals` 대여 이력
- [ ] 프로필 이미지 업로드

### Phase 3 — 공지 / 문의 / 행사 (P2)
- [ ] `/notices` 공지 목록 + 상단고정 처리
- [ ] `/notices/[id]` 공지 상세 + 이미지 표시
- [ ] `/inquiries` 문의 목록 (비밀글 마스킹)
- [ ] `/inquiries/new` 문의 작성
- [ ] `/events` 행사 목록 및 신청

### Phase 4 — 관리자 (P3)
- [ ] `/admin` 대시보드
- [ ] `/admin/books` 도서 CRUD
- [ ] `/admin/notices` 공지 CRUD + 이미지 업로드
- [ ] `/admin/inquiries` 문의 응답
- [ ] `/admin/events` 행사 관리
- [ ] `/admin/members` 회원 관리 (역할 변경 / 삭제)
- [ ] `/admin/facility` 시설예약 관리
- [ ] 관리자 역할 가드 (`role === 'ADMIN'`)

### Phase 5 — 부가 (P4)
- [ ] `/ai` AI 예측 페이지 (Flask 연동)
- [ ] 다크모드 토글
- [ ] i18n (선택)
- [ ] E2E 테스트 (Playwright)

---

## 8. 주의사항 / 알려진 이슈

1. **CORS**: Spring Security 의 `CustomSecurityConfig` 가 `http://localhost:3000` 을 허용하도록 확인. 이미 Flutter 용으로 `*` 또는 특정 Origin 만 허용 중일 수 있음.
2. **JWT 저장 위치**: 초기엔 `localStorage` 로 빠르게 구현 → 이후 XSS 방어 위해 httpOnly 쿠키 + Next.js Route Handler 중계로 마이그레이션 권장.
3. **이미지 업로드**: Spring 측 `MultipartFile` 엔드포인트 기존 그대로 사용, `FormData` 로 전송. `Content-Type: multipart/form-data` 자동 설정.
4. **페이지네이션**: Spring `Page<T>` 구조(`content`, `totalElements`, `number`, `size`)를 TypeScript 타입으로 표준화 (`types/page.ts`).
5. **라우팅 보호**: App Router 의 middleware 또는 클라이언트 측 `Protected` 컴포넌트 중 전략 선택. 초기엔 클라이언트 측으로.
6. **SSR 주의**: 토큰이 `localStorage` 에 있으면 SSR 시 접근 불가 → 해당 페이지는 `"use client"` 로 처리.

---

## 9. 진행 방식

1. 본 문서의 **Phase 별 체크박스**를 기준으로 순차 진행.
2. 각 Phase 완료 시 체크박스를 `[x]` 로 전환하고 커밋.
3. 백엔드 수정이 필요하면 별도 이슈로 분리.
4. 큰 변경은 PR 단위로 분리해 리뷰.
