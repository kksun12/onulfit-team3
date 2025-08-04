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
