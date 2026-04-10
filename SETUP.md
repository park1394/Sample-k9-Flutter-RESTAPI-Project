# 프로젝트 셋업 가이드

부산도서관 관리 시스템 — Flutter (프론트) + Spring Boot (백엔드) 개발 환경 구축 및 실행 가이드입니다.

## 1. 프로젝트 구성

```
0-sample-flutter-projectt-k9/
├── Flutter-Front/              # Flutter 모바일 앱 (Android/iOS)
│   └── lib/const/api_constants.dart   # 백엔드 API 주소 설정
├── Spring-Back/SpringBasic/
│   └── api5012/                # Spring Boot 3 + JPA 백엔드
│       └── src/main/resources/application.properties  # DB/JWT 설정
└── Flask-Back/                 # (선택) Flask 예측 서비스
```

## 2. 사전 준비물

| 도구 | 권장 버전 | 용도 |
|---|---|---|
| JDK | 17 이상 | Spring Boot 컴파일/실행 |
| MariaDB | 10.x 이상 | 백엔드 DB (webdb) |
| Flutter SDK | 3.x 이상 | Flutter 앱 빌드/실행 |
| Android Studio | 최신 | Android 에뮬레이터, Flutter 플러그인 |
| Git | 2.x 이상 | 저장소 클론/포크 |

## 3. 저장소 클론 / 포크

### 포크 후 클론 (권장 — 개인 작업용)

1. GitHub에서 원본 저장소 우측 상단 **Fork** 클릭 → 본인 계정으로 복사
2. 포크된 저장소에서 클론:

```bash
git clone https://github.com/<본인계정>/<저장소명>.git
cd <저장소명>
```

3. (선택) 원본을 upstream 으로 등록해 최신 변경 동기화:

```bash
git remote add upstream https://github.com/<원본계정>/<저장소명>.git
git fetch upstream
git merge upstream/main
```

### 바로 클론 (읽기 전용)

```bash
git clone https://github.com/<원본계정>/<저장소명>.git
cd <저장소명>
```

## 4. 백엔드 (Spring Boot) 실행

### 4-1. MariaDB 준비

[application.properties](Spring-Back/SpringBasic/api5012/src/main/resources/application.properties) 의 기본값:

```
spring.datasource.url=jdbc:mariadb://localhost:3306/webdb
spring.datasource.username=webuser
spring.datasource.password=webuser
```

DB 및 사용자 생성 (MariaDB 콘솔에서 실행):

```sql
CREATE DATABASE webdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'webuser'@'localhost' IDENTIFIED BY 'webuser';
GRANT ALL PRIVILEGES ON webdb.* TO 'webuser'@'localhost';
FLUSH PRIVILEGES;
```

> `spring.jpa.hibernate.ddl-auto=update` 설정이므로 **첫 실행 시 테이블이 자동 생성**됩니다. 별도 DDL 스크립트는 필요 없습니다.

### 4-2. 빌드 및 실행

```bash
cd Spring-Back/SpringBasic/api5012

# Windows
./gradlew bootRun

# macOS / Linux
./gradlew bootRun
```

기본 포트 **8080** 에서 기동됩니다. 성공 시 콘솔에 `Started Api5012Application` 로그가 출력됩니다.

### 4-3. 백엔드 기동 확인

브라우저 또는 curl:

```bash
curl http://localhost:8080/api/book/list?page=0&size=10
```

## 5. 프론트엔드 (Flutter) 실행

### 5-1. 의존성 설치

```bash
cd Flutter-Front
flutter pub get
```

### 5-2. API 주소 설정 ⚠️ 중요

[Flutter-Front/lib/const/api_constants.dart](Flutter-Front/lib/const/api_constants.dart) 에서 백엔드 주소를 **실행 환경에 맞게 수정**해야 합니다.

```dart
class ApiConstants {
  // 에뮬레이터 기본값
  static const String springBaseUrl = 'http://10.0.2.2:8080/api';
  static const String flaskBaseUrl  = 'http://10.0.2.2:5000/predict';
}
```

#### 5-2-1. Android 에뮬레이터에서 실행할 경우

- 반드시 **`10.0.2.2`** 를 사용하세요.
- `localhost` 나 `127.0.0.1` 은 **에뮬레이터 내부의 가상 리눅스**를 가리키므로 호스트 PC 의 Spring 서버에 도달하지 못합니다.
- `10.0.2.2` 는 Android 에뮬레이터가 호스트 머신의 루프백 주소로 연결해 주는 **특수 게이트웨이 IP** 입니다.
- iOS 시뮬레이터는 `localhost` 또는 `127.0.0.1` 을 그대로 사용할 수 있습니다.

| 실행 환경 | 사용할 IP |
|---|---|
| Android 에뮬레이터 | `10.0.2.2` |
| iOS 시뮬레이터 | `localhost` / `127.0.0.1` |
| 웹(Chrome) | `localhost` / `127.0.0.1` |
| 실물 기기 | 호스트 PC의 **내부 사설 IP** (아래 참조) |

#### 5-2-2. 실물 기기(Android/iOS 휴대폰)에서 실행할 경우 ⚠️

- **`10.0.2.2` / `localhost` 는 절대 동작하지 않습니다.**
- 반드시 **호스트 PC 의 실제 내부 사설 IP**(같은 공유기/와이파이 안에서 접근 가능한 주소)를 사용해야 합니다.
- 예: `192.168.0.12`, `192.168.1.34`, `10.0.0.15` 등

**반드시 확인할 체크리스트**:

1. **휴대폰과 PC 가 동일한 Wi-Fi(동일 서브넷)** 에 연결되어 있는가?
2. PC 의 내부 IP 확인:
   - Windows: `ipconfig` → **IPv4 주소** 확인 (예: `192.168.0.12`)
   - macOS / Linux: `ifconfig` 또는 `ip addr`
3. PC 방화벽에서 **8080 포트 인바운드 허용**:
   - Windows Defender 방화벽 → 인바운드 규칙 → 포트(TCP 8080) 허용
   - macOS: `시스템 설정 → 네트워크 → 방화벽 → 옵션`
4. (선택) 같은 네트워크의 다른 기기에서 `http://<PC_IP>:8080/api/...` 접속 테스트
5. Spring 서버가 `0.0.0.0` 에 바인딩되는지 확인 (기본값 OK — `localhost` 전용 바인딩이 아님)

**수정 예시** — 호스트 IP 가 `192.168.0.12` 인 경우:

```dart
class ApiConstants {
  static const String springBaseUrl = 'http://192.168.0.12:8080/api';
  static const String flaskBaseUrl  = 'http://192.168.0.12:5000/predict';
}
```

> 💡 **Tip**: 카페/학교 등 공용 Wi-Fi 에서는 **AP 격리(Client Isolation)** 가 활성화된 경우 같은 네트워크라도 PC ↔ 휴대폰 간 통신이 차단될 수 있습니다. 이 때는 개인 핫스팟/유선 공유기를 사용하세요.

### 5-3. 앱 실행

```bash
# 연결된 디바이스 확인
flutter devices

# 특정 디바이스에 실행
flutter run -d <device_id>

# 또는 Android Studio / VS Code 에서 실행 버튼 클릭
```

## 6. 로그인 계정

초기 DB 에는 계정이 없으므로 앱의 **회원가입** 화면에서 먼저 가입한 후 로그인하세요. 관리자 권한 계정은 DB 에서 해당 회원의 `role` 컬럼을 `ADMIN` 으로 수정하여 부여할 수 있습니다.

```sql
UPDATE member SET role = 'ADMIN' WHERE mid = '<로그인ID>';
```

## 7. 자주 발생하는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| `Connection refused` (에뮬레이터) | `localhost` 사용 | `10.0.2.2` 로 변경 |
| `Connection refused` (실물기기) | 잘못된 IP 또는 방화벽 | 호스트 사설 IP 확인 + 8080 포트 허용 |
| `Connection timed out` (실물기기) | 다른 네트워크 / AP 격리 | 동일 Wi-Fi 확인, 핫스팟 테스트 |
| `JWT` 401 에러 | 토큰 만료 / 재로그인 필요 | 앱 재로그인 |
| Spring 기동 실패 (DB) | MariaDB 미기동, 계정/DB 없음 | 4-1 단계 재확인 |
| `ddl-auto=update` 관련 오류 | 엔티티 변경 후 스키마 충돌 | 개발 DB 재생성 또는 테이블 수동 정리 |

## 8. 개발 워크플로우 (포크 사용자 기준)

```bash
# 새 기능 브랜치 생성
git checkout -b feature/my-work

# 변경 후 커밋
git add <파일>
git commit -m "feat: 기능 설명"

# 본인 원격에 푸시
git push -u origin feature/my-work

# GitHub 에서 원본 저장소로 Pull Request 생성
```

## 9. 참고 문서

- [README.md](README.md) — 프로젝트 소개
- [API_DOCS.md](API_DOCS.md) — API 명세
- [FEATURE_FILES.md](FEATURE_FILES.md) — 기능별 파일 매핑
- [docs/ADMIN_FEATURE_FLOW.md](docs/ADMIN_FEATURE_FLOW.md) — 관리자 기능 흐름
