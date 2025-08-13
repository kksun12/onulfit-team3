# OnulFit - 유연한 건강 루틴 추천 시스템

**바쁜 현대인의 일정 속에서도 무리 없이 실천할 수 있는 운동·식단 루틴 제공 플랫폼**

## 📌 프로젝트 개요

현대인들은 건강의 중요성을 알고 있음에도 불구하고 불규칙한 일정과 과중한 업무로 인해 꾸준한 운동과 식단 관리가 어렵습니다.

이 프로젝트는 **개인의 라이프스타일과 일정을 반영한 맞춤형 루틴**을 추천해주는 시스템으로, **운동/식단 루틴의 실천률을 높이고 지속 가능한 건강관리를 돕는 것**을 목표로 합니다.

## 👥 팀 구성 및 역할

| 이름 | 역할 | 담당 영역 |
|------|------|------------|
| 최호균 | 팀장 | 프론트엔드 개발, DB 스키마 구성 |
| 김기선 | 팀원 | 프론트엔드 개발, UI/UX 디자인 |
| 이성민 | 팀원 | 백엔드 개발, AI 모듈 개발 |

## 🚀 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication)
- **State Management**: Zustand
- **Icons**: Lucide React, React Icons

## 📋 현재 구현된 기능

- [x] 사용자 인증 (로그인/회원가입)
- [x] 사용자 프로필 관리
- [x] 홈 대시보드 (주간 스케줄 뷰)
- [x] 건강 솔루션 서비스 (운동/식단 데이터 관리)
- [x] 식단 페이지
- [x] 식단 건강 입력 기능
- [x] AI 채팅 기능
- [x] 프로필 페이지
- [x] 반응형 디자인
- [x] Supabase 연동 완료

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
│   ├── signup/              # 회원가입 페이지
│   ├── home/                # 홈 대시보드
│   ├── diet/                # 식단 페이지
│   ├── diet-health-insert/  # 식단 건강 입력 페이지
│   ├── chat/                # AI 채팅 페이지
│   └── profile/             # 프로필 페이지
├── components/
│   ├── home/                # 홈 관련 컴포넌트
│   │   ├── Header.tsx
│   │   ├── WelcomeSection.tsx
│   │   ├── WeeklySchedule.tsx
│   │   └── DayDetails.tsx
│   ├── chatMessageList.tsx  # 채팅 메시지 리스트
│   └── chatTextarea.tsx     # 채팅 입력창
├── lib/
│   └── supabase.ts          # Supabase 클라이언트
├── services/
│   └── healthSolutionService.ts  # 건강 솔루션 API 서비스
├── stores/
│   └── userStore.ts         # 사용자 상태 관리 (Zustand)
└── types/
    └── database.ts          # 데이터베이스 타입 정의
```

## 🗄️ 데이터베이스 구조

### 주요 테이블

- **user_profiles**: 사용자 프로필 정보
- **health_solutions**: 주간 건강 솔루션 메타 정보
- **solution_workouts**: 솔루션별 운동 계획
- **solution_meals**: 솔루션별 식단 계획
- **exercises**: 운동 마스터 데이터
- **meals**: 식단 마스터 데이터

## 🎨 주요 컴포넌트

- **로그인/회원가입**: 이메일 기반 인증
- **홈 대시보드**: 주간 스케줄 뷰, 환영 메시지
- **건강 솔루션**: 운동/식단 데이터 통합 관리
- **AI 채팅**: 건강 관련 상담 및 조언 기능
- **식단 건강 입력**: 사용자 맞춤형 식단 데이터 입력
- **사용자 프로필**: 개인 정보 및 건강 목표 관리

## 🔧 개발 가이드

### 상태 관리

- Zustand를 사용한 전역 상태 관리
- 사용자 인증 상태 및 프로필 정보 관리

### 데이터 페칭

- Supabase 클라이언트를 통한 실시간 데이터 연동
- 서비스 레이어를 통한 비즈니스 로직 분리

### 코드 스타일

- TypeScript 사용
- Tailwind CSS로 스타일링
- 컴포넌트별 파일 분리
- 함수형 컴포넌트 사용

## 🔮 향후 계획

- [ ] AI 기반 맞춤형 루틴 추천
- [ ] 일정 연동 기능
- [ ] 진행률 추적 및 통계
- [ ] 알림 기능
- [ ] 소셜 기능
- [ ] 다크 모드

## 📄 라이선스

MIT License