# 🧩 프론트엔드 및 백엔드 기능별 작업 파일 목록 (Feature File Map)

본 문서는 **부산도서관 관리 시스템** 내에서 구현해야 할(혹은 구현된) 각 기능 단위별로 어떤 Flutter / Spring Boot 파일들이 연관되어 있는지를 기록하는 아키텍처 매핑 문서입니다.

---

## 1. 회원 (Member & Auth) 기능
> 로그인, 회원가입, 내 정보 조회, 역할(USER/ADMIN) 기반 API 접근 관리 등을 담당합니다.

| 분류 | 작업 파일 | 역할 |
|---|---|---|
| **Flutter (프론트)** | `lib/model/member_model.dart` | 회원 정보를 담는 데이터 모델 구조 (fromJson, toJson) |
| | `lib/controller/auth/login_controller.dart` | 로그인 API 통신 및 토큰 처리 등 인증 비즈니스 로직 |
| | `lib/controller/auth/signup_controller.dart` | 회원가입 통신 로직 및 이미지 처리 관리 |
| | `lib/screen/login_screen.dart` | 로그인 화면 컴포넌트 UI |
| | `lib/screen/signup_screen.dart` | 회원가입 및 프로필 이미지 첨부 화면 컴포넌트 UI |
| | `lib/screen/mypage_screen.dart` | 마이페이지(회원 전용 서비스 모음) 뷰 |
| **Spring (백엔드)** | `domain/Member.java`, `domain/MemberRole.java` | DB 매핑 회원 테이블 및 권한 Enum |
| | `dto/library/MemberDTO.java` 등 | 클라이언트간 데이터 전송용 회원 전용 DTO 객체 세트 |
| | `repository/library/MemberRepository.java` | Spring Data JPA 회원 쿼리 처리 인터페이스 |
| | `service/MemberService.java` (`Impl` 포함) | 회원가입, 수정, 비밀번호 확인 등 비즈니스 로직 및 인터페이스 |
| | `controller/LibraryMemberController.java` | 회원 관련 RESTful 엔드포인트 제공 |
| | `security/filter/*`, `handler/*` | JWT 발행 / 인가/인증 보안 연동 필터들 |

---

## 2. 도서 (Book) 기능
> 도서관의 책을 검색하고, 상세 정보를 QR 코드와 연계해 보여주는 핵심 도메인입니다.

| 분류 | 작업 파일 | 역할 |
|---|---|---|
| **Flutter (프론트)** | `lib/model/book_model.dart` | 책 상세 정보 및 상태 관리를 위한 모델 |
| | `lib/controller/book_controller.dart` | 도서 검색 및 DB 페치(Fetch) 비동기 처리 관리 |
| | `lib/screen/book/book_list_screen.dart` | 도서 리스트 및 검색 결과 화면 UI |
| | `lib/screen/book/book_detail_screen.dart` | 상세 도서 정보 화면 UI |
| **Spring (백엔드)** | `domain/Book.java`, `domain/BookStatus.java` | 도서 엔티티 설계 및 상태(대여가능/예약중/대여중 등) Enum |
| | `dto/library/BookDTO.java` | 도서 및 Pagination용 맵핑 객체 |
| | `repository/library/BookRepository.java` | 도서 DB 조작 및 커스텀 검색 쿼리 인터페이스 |
| | `service/library/BookService.java` | 도서 등록/수정/페이징 조회 비즈니스 로직 |
| | `controller/BookController.java` | 도서 관련 RESTful API 노출 |

---

## 3. 도서 대여 및 반납 (Rental) 기능
> 회원이 도서를 대여하고 반납하거나, 대기/연장/오버듀 등 상태를 모니터링합니다.

| 분류 | 작업 파일 | 역할 |
|---|---|---|
| **Flutter (프론트)** | `lib/model/rental_model.dart` | 도서 대여 이력 데이터를 구성하는 데이터 모델 |
| | `lib/controller/rental_controller.dart` | 회원별 개인 대여 이력을 서버에서 불러오고 상태 추적하는 로직 |
| | `lib/screen/rental/rental_list_screen.dart` | 마이페이지 등에서 접근하는 내 대여 현황 히스토리 화면 |
| **Spring (백엔드)** | `domain/Rental.java`, `domain/RentalStatus.java` | 대여 이력 엔티티 및 상태 Enum |
| | `dto/library/RentalDTO.java` | 대여 로직용 데이터 전송 객체 |
| | `service/library/RentalService.java` | 대여 처리, 반납 관리 및 연체 규칙 비즈니스 로직 |
| | `controller/RentalController.java` | 대여 프로세스를 관장하는 REST 커뮤니케이션 허브 |

---

## 4. 커뮤니티 및 공지 (Notice & Event) 기능
> 관리자가 작성한 공지사항과 이달의 행사(도서관 이벤트) 안내 및 예약 정보를 보여줍니다.

| 분류 | 작업 파일 | 역할 |
|---|---|---|
| **Flutter (프론트)** | `lib/model/notice_model.dart`, `event_model.dart` | 공지 및 행사 구조화 모델 |
| | `lib/controller/notice_controller.dart` | 최신 공지사항을 비동기로 로드 |
| | `lib/controller/event_controller.dart` | 진행 중인 행사 데이터를 추적 |
| | `lib/screen/notice/*`, `lib/screen/event/*` | 공지 및 행사 리스트 / 상세페이지를 렌더링하는 UI 분리 |
| **Spring (백엔드)** | `domain/Notice.java`, `LibraryEvent.java` | 공지 정보 및 도서관 행사 캘린더 엔티티 설계 |
| | `domain/EventApplication.java` | 회원의 다대일 행사 참관 신청 매핑 |
| | `service/library/NoticeService.java` 등 | 공지 노출 / 행사 등록 비즈니스 계층 로직 |
| | `controller/NoticeController.java` 등 | 공지/행사 조회를 위한 API 엔드포인트 세팅 |

---

## 5. 고객 지원 1:1 문의 (Inquiry) 기능
> 시스템 사용 중 겪는 사항이나 요구사항을 관리자에게 문의하고 답글(Reply)을 받습니다.

| 분류 | 작업 파일 | 역할 |
|---|---|---|
| **Flutter (프론트)** | `lib/model/inquiry_model.dart` | 문의 사항(제목, 내용 등)을 매핑하는 객체 |
| | `lib/controller/inquiry_controller.dart` | 문의 Post 기능 및 과거 질문 리스트 연동을 지원 |
| | `lib/screen/inquiry/*` | 문의하기 목록, 글쓰기 폼(Form), 상세내역 화면 UI |
| **Spring (백엔드)** | `domain/Inquiry.java`, `Reply.java` | 문의 내역 및 1:N형태로 달리는 답글 엔티티 (JPA) |
| | `repository/library/InquiryRepository.java` | 문의 영속화 처리 |
| | `service/library/InquiryService.java` | 본인 글 및 비밀글 여부, 작성 처리, 답변 연동 조회 |
| | `controller/InquiryController.java` | 양뱡향 문의 API 등록 |

---

## 6. 도서관 시설 예약 (Apply/Reserve) 기능
> 열람실 배석, 스터디 룸과 같은 도서관 물리 시설 예약을 의미합니다.

| 분류 | 작업 파일 | 역할 |
|---|---|---|
| **Flutter (프론트)** | `lib/model/apply_model.dart` | 시설 종류 및 시간 예약 결과를 매핑하는 모델 |
| | `lib/controller/reserve_controller.dart` | 시설 현황 체크 및 내가 예약한 시설 상태를 유지 관리 |
| | `lib/screen/reserve/facility_reserve_screen.dart` | 시간대 배정/선택용 예약 화면 뷰 |
| **Spring (백엔드)** | `domain/Apply.java` | 시설 좌석 및 시간 예약 정보 매핑 엔티티 |
| | `dto/library/ApplyDTO.java` | 프론트엔드가 요청한 시설 예약 데이터 파라미터 묶음 |
| | `service` 및 `controller` 계층 | 시간별 좌석 중복 검증, 예약 로직 API 수행 |

---

## 7. AI 기능 (이미지 분류 모델 연동 등)
> 머신러닝 모듈(ResNet 기반)을 활용하는 도서/사물 분류 기능 요소입니다.

| 분류 | 작업 파일 | 역할 |
|---|---|---|
| **Flutter (프론트)** | `lib/controller/ai/image/ai_image_controller.dart` | Flask Back 서버와의 http multipart 통신 전담 |
| | `lib/screen/ai/ai_image_screen.dart` | 사진 촬영 및 카메라 앨범 선택을 통한 이미지 제출용 UI |
| **Flask (AI 백엔드)** | `app.py` | 모바일 데이터를 분석하고 라벨(Label) 결과를 전달하는 핵심 추론 허브 |
| | `resnet50_best_team*.pth` 등 | 무거운 AI 이미지 판독 가중치 모델 데이터 로드용 에셋 |
