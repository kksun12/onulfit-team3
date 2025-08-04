<<<<<<< HEAD
# OnulFit - 건강한 루틴

바쁜 현대인의 스케줄에 맞춘 유연한 건강 루틴 제공 서비스입니다.

## 🚀 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication)
- **Icons**: Lucide React

## 📋 기능

- [x] 사용자 로그인/회원가입
- [x] 홈 대시보드
- [x] 오늘의 루틴 관리
- [x] 운동 완료 상태 추적
- [x] 실시간 시간 표시
- [x] 반응형 디자인

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 개발 환경 설정
NODE_ENV=development
```

#### Supabase 설정 방법

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정 → API에서 URL과 anon key 복사
3. `.env.local` 파일에 붙여넣기

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── globals.css          # 전역 스타일
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 로그인 페이지
│   └── home/
│       └── page.tsx         # 홈 페이지
├── lib/
│   └── supabase.ts          # Supabase 클라이언트
└── components/              # 재사용 가능한 컴포넌트 (향후 추가)
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: 파란색 계열 (#0ea5e9)
- **Secondary**: 보라색 계열 (#d946ef)
- **Success**: 초록색 계열 (#22c55e)
- **Gray**: 회색 계열 (#6b7280)

### 주요 컴포넌트

- **로그인 폼**: 이메일/비밀번호 입력, 비밀번호 표시/숨김 토글
- **대시보드**: 통계 카드, 실시간 시간 표시
- **루틴 카드**: 운동 목록, 완료 상태, 재생/일시정지 기능

## 🔧 개발 가이드

### Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. Authentication 설정
3. Database 테이블 생성 (향후 구현)

### 코드 스타일

- TypeScript 사용
- Tailwind CSS로 스타일링
- 컴포넌트별 파일 분리
- 함수형 컴포넌트 사용

## 📱 반응형 디자인

- 모바일 우선 접근법
- Tailwind CSS의 반응형 클래스 활용
- 터치 친화적 인터페이스

## 🔒 보안 및 환경 변수

### .gitignore 설정

프로젝트에는 다음 파일들이 포함되지 않습니다:

- `.env.local` - 로컬 환경 변수
- `node_modules/` - 의존성 패키지
- `.next/` - Next.js 빌드 파일
- 기타 개발 도구 설정 파일들

### 환경 변수 관리

- `.env.local`: 로컬 개발용 (Git에 포함되지 않음)
- `.env.example`: 환경 변수 예시 파일 (Git에 포함됨)

## 🔮 향후 계획

- [ ] Supabase 연동 완료
- [ ] 사용자 프로필 관리
- [ ] 운동 루틴 커스터마이징
- [ ] 진행률 차트 및 통계
- [ ] 알림 기능
- [ ] 소셜 로그인
- [ ] 다크 모드

## 📄 라이선스

MIT License
=======
# 🧠 유연한 건강 루틴 추천 시스템

**"바쁜 현대인의 일정 속에서도 무리 없이 실천할 수 있는 운동·식단 루틴 제공 플랫폼"**

---

## 📌 프로젝트 개요

현대인들은 건강의 중요성을 알고 있음에도 불구하고  
**불규칙한 일정과 과중한 업무**로 인해 꾸준한 운동과 식단 관리가 어렵습니다.

이 프로젝트는 **개인의 라이프스타일과 일정을 반영한 맞춤형 루틴**을 추천해주는 시스템으로,  
**운동/식단 루틴의 실천률을 높이고 지속 가능한 건강관리를 돕는 것**을 목표로 합니다.

---

## ✅ 핵심 기능 (1차 MVP 기준)

- 📆 사용자의 일정 등록 및 분석
- 🏃 간단한 운동 루틴 자동 추천
- 🍱 기본적인 식단 루틴 제안
- 🔄 일정 변경 시 루틴 자동 재조정
- 🧠 GPT 기반 AI 코치 응답 (간단한 대화 피드백)

---

## 👥 팀 구성 및 역할

| 이름 | 역할 | 담당 영역 |
|------|------|------------|
| 🧑‍💻 팀장   | PM, 백엔드 개발 | 아키텍처 설계, Spring Boot API 개발, DB 모델링, GPT 연동 |
| 👩‍💻 팀원 A | 프론트엔드 개발 | Next.js UI 개발, 사용자 일정 등록 화면, API 연동, UX 설계 |

---

## 🧱 기술 스택

- **프론트엔드**: Next.js, Tailwind CSS, React Calendar
- **백엔드**: Spring Boot, JPA, Supabase (PostgreSQL)
- **AI 코치**: OpenAI GPT API
- **인증**: Supabase Auth 또는 JWT 기반
- **배포**: Vercel (프론트), EC2 or Railway (백엔드)

---

## 🚧 진행 로드맵 (MVP 기준)

| 단계 | 내용 | 상태 |
|------|------|------|
| 1단계 | 기획 및 문제 정의 | ✅ 완료 |
| 2단계 | 기술 스택 선정 및 아키텍처 설계 | 🔄 진행 중 |
| 3단계 | DB 설계 및 API 명세 | 🔄 진행 중 |
| 4단계 | 일정 등록 기능 구현 | ⏳ 예정 |
| 5단계 | 운동 루틴 추천 로직 구현 | ⏳ 예정 |
| 6단계 | 프론트 화면 구성 및 API 연동 | ⏳ 예정 |
| 7단계 | GPT 연동 및 대화 피드백 기능 추가 | ⏳ 예정 |
| 8단계 | 배포 및 테스트 | ⏳ 예정 |

---
>>>>>>> ed2453cffc38da8d99f7ad225ec1d0d1780c3a40
