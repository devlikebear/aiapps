# Vercel 배포 가이드

AI Apps 프로젝트를 Vercel에 배포하고 관측성 도구를 설정하는 종합 가이드입니다.

## 목차

- [사전 준비사항](#사전-준비사항)
- [Vercel 프로젝트 생성](#vercel-프로젝트-생성)
- [환경 변수 설정](#환경-변수-설정)
- [빌드 및 배포 설정](#빌드-및-배포-설정)
- [관측성 도구 설정](#관측성-도구-설정)
- [도메인 설정](#도메인-설정)
- [배포 후 검증](#배포-후-검증)
- [트러블슈팅](#트러블슈팅)

---

## 사전 준비사항

### 1. 필수 계정

- **GitHub 계정**: 소스 코드 저장소
- **Vercel 계정**: https://vercel.com/signup
- **Google Cloud 계정**: Gemini API 키 발급용

### 2. Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. API 키 복사 (나중에 환경 변수로 사용)

### 3. 로컬 빌드 테스트

배포 전 로컬에서 프로덕션 빌드 테스트:

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 번들 사이즈 분석 (선택 사항)
npm run analyze
```

---

## Vercel 프로젝트 생성

### 방법 1: Vercel Dashboard (권장)

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard 접속
   - "Add New..." → "Project" 클릭

2. **GitHub 저장소 연결**
   - "Import Git Repository" 선택
   - GitHub 계정 연동 (처음인 경우)
   - `aiapps` 저장소 선택
   - "Import" 클릭

3. **프로젝트 설정**
   ```
   Project Name: aiapps (또는 원하는 이름)
   Framework Preset: Next.js (자동 감지됨)
   Root Directory: ./
   Build Command: npm run build (자동 설정됨)
   Output Directory: .next (자동 설정됨)
   Install Command: npm install (자동 설정됨)
   ```

4. **환경 변수 추가** (다음 섹션 참고)

5. **Deploy 버튼 클릭**

### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 프로젝트 초기화 및 배포
vercel

# 프로덕션 배포
vercel --prod
```

---

## 환경 변수 설정

### Vercel Dashboard에서 설정

1. **프로젝트 Settings 이동**
   - Vercel Dashboard → 프로젝트 선택
   - "Settings" 탭 클릭
   - "Environment Variables" 메뉴 선택

2. **환경 변수 추가**

#### Production 환경

| 변수 이름 | 값 | 설명 |
|----------|-----|------|
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` | 프로덕션 도메인 URL |
| `NODE_ENV` | `production` | 환경 모드 (자동 설정됨) |

#### Preview 환경 (선택 사항)

| 변수 이름 | 값 | 환경 |
|----------|-----|------|
| `NEXT_PUBLIC_APP_URL` | `https://preview-aiapps.vercel.app` | Preview |

#### Development 환경 (로컬 개발용)

로컬 개발 환경에서는 `.env.local` 파일 사용:

```bash
# .env.local (Git에 커밋되지 않음)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Gemini API 키 관리

**이 프로젝트는 서버 측 환경 변수가 아닌 클라이언트 측 localStorage를 사용합니다.**

#### API 키 저장 방식

1. **사용자별 API 키 관리**
   - 각 사용자가 자신의 Gemini API 키를 직접 입력
   - 브라우저 localStorage에 AES-256-GCM 암호화하여 저장
   - 디바이스 지문 기반 암호화 키 생성

2. **설정 페이지에서 입력**
   - 배포 후 사용자가 `/settings` 페이지 방문
   - "API Key Settings" 섹션에서 Gemini API 키 입력
   - 브라우저에 안전하게 저장됨

3. **보안 구현**

   ```typescript
   // lib/api-key/encryption.ts
   // - AES-256-GCM 암호화
   // - navigator 기반 디바이스 지문
   // - localStorage 저장
   ```

#### API 키 발급 안내

사용자에게 다음 안내 제공:

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Create API Key" 클릭
3. API 키 복사
4. 앱의 Settings 페이지(`/settings`)에서 입력

**중요**:

- 서버 측에 API 키를 저장하지 않음 (보안 강화)
- 각 사용자가 자신의 API 키로 Gemini API 호출
- 서버는 API 호출을 중계하지 않고, 클라이언트가 직접 호출

---

## 빌드 및 배포 설정

### 자동 배포 설정

Vercel은 기본적으로 다음과 같이 자동 배포됩니다:

1. **프로덕션 배포**
   - `main` 브랜치에 푸시 시 자동 배포
   - 배포 URL: `https://your-project.vercel.app`

2. **프리뷰 배포**
   - Pull Request 생성 시 자동 프리뷰 배포
   - 배포 URL: `https://your-project-git-[branch].vercel.app`

### 빌드 설정 커스터마이징

#### vercel.json (선택 사항)

프로젝트 루트에 `vercel.json` 파일 생성:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

**설정 설명**:
- `regions`: 서울 리전 (`icn1`) 사용 - 한국 사용자에게 빠른 응답
- `maxDuration`: API 함수 최대 실행 시간 (Free tier: 10초, Pro: 60초)

#### Next.js 설정 확인

`next.config.ts` 파일이 Vercel 배포에 최적화되어 있는지 확인:

```typescript
import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // X-Powered-By 헤더 제거 (보안)
  compress: true, // gzip 압축 활성화
  images: {
    formats: ['image/avif', 'image/webp'], // 최신 이미지 포맷
  },
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'], // 번들 크기 최적화
  },
};

export default withBundleAnalyzer(nextConfig);
```

---

## 관측성 도구 설정

Vercel에서 제공하는 관측성 도구를 활성화하여 성능 모니터링 및 분석을 수행합니다.

### 1. Speed Insights 설정

**자동 활성화**: 이미 코드에 통합되어 있음 (`app/layout.tsx`)

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

// Layout에 추가됨
<SpeedInsights />
```

#### Vercel Dashboard에서 확인

1. Vercel Dashboard → 프로젝트 선택
2. "Speed Insights" 탭 클릭
3. 실시간 Core Web Vitals 확인:
   - **LCP** (Largest Contentful Paint): 2.5초 이하 목표
   - **FID** (First Input Delay): 100ms 이하 목표
   - **CLS** (Cumulative Layout Shift): 0.1 이하 목표
   - **TTFB** (Time to First Byte): 800ms 이하 목표
   - **INP** (Interaction to Next Paint): 200ms 이하 목표

#### Speed Insights 요금제

| 요금제 | 월 페이지뷰 | 가격 |
|--------|-------------|------|
| Free | 10,000 | $0 |
| Pro | 100,000 | $10 |
| Enterprise | Unlimited | Custom |

### 2. Analytics 설정

**자동 활성화**: 이미 코드에 통합되어 있음 (`app/layout.tsx`)

```typescript
import { Analytics } from '@vercel/analytics/react';

// Layout에 추가됨
<Analytics />
```

#### Vercel Dashboard에서 확인

1. Vercel Dashboard → 프로젝트 선택
2. "Analytics" 탭 클릭
3. 다음 지표 확인:
   - **페이지 뷰**: 총 방문 수
   - **고유 방문자**: 중복 제거된 방문자 수
   - **탑 페이지**: 가장 많이 방문한 페이지
   - **리퍼러**: 유입 경로
   - **디바이스**: 데스크톱/모바일 비율
   - **브라우저**: 사용자 브라우저 분포

#### Analytics 요금제

| 요금제 | 월 이벤트 | 가격 |
|--------|-----------|------|
| Free | 2,500 | $0 |
| Pro | 100,000 | $10 |
| Enterprise | Unlimited | Custom |

### 3. Web Vitals 커스텀 리포팅

프로젝트에 이미 구현된 커스텀 Web Vitals 리포팅:

```typescript
// lib/monitoring/web-vitals.ts
export function reportWebVitals() {
  onLCP((metric) => sendToAnalytics(metric));
  onCLS((metric) => sendToAnalytics(metric));
  onTTFB((metric) => sendToAnalytics(metric));
  onINP((metric) => sendToAnalytics(metric));
  onFCP((metric) => sendToAnalytics(metric));
}
```

**개발 모드**에서는 브라우저 콘솔에 Web Vitals 로그가 출력됩니다.

### 4. Server-Timing 헤더 모니터링

API 응답 시간을 추적하기 위한 Server-Timing 헤더가 자동으로 추가됩니다.

#### 브라우저에서 확인

1. Chrome DevTools 열기 (`F12`)
2. "Network" 탭 선택
3. API 요청 선택 (예: `/api/audio/generate`)
4. "Timing" 탭에서 Server-Timing 확인:
   - `rateLimit`: Rate limiting 시간
   - `validation`: 입력 검증 시간
   - `generation`: AI 생성 시간
   - `conversion`: 포맷 변환 시간
   - `encoding`: Base64 인코딩 시간
   - `total`: 전체 응답 시간

### 5. Log Streams (Pro 플랜)

실시간 로그 스트리밍 (Vercel Pro 플랜 이상):

1. Vercel Dashboard → 프로젝트 선택
2. "Deployments" 탭 → 배포 선택
3. "Functions" 탭 클릭
4. API Route 선택하여 실시간 로그 확인

### 6. 번들 분석 (로컬)

배포 전 번들 크기 분석:

```bash
npm run analyze
```

브라우저에서 자동으로 열리는 번들 분석 리포트 확인:
- 각 패키지의 크기
- 의존성 트리
- 최적화 기회

---

## 도메인 설정

### 1. Vercel 제공 도메인

기본 도메인: `https://your-project.vercel.app`

- 추가 설정 불필요
- HTTPS 자동 활성화
- 글로벌 CDN 자동 적용

### 2. 커스텀 도메인 연결

#### 도메인 추가

1. Vercel Dashboard → 프로젝트 선택
2. "Settings" 탭 → "Domains" 메뉴
3. "Add" 버튼 클릭
4. 도메인 입력 (예: `aiapps.com`)

#### DNS 설정

도메인 등록업체(Namecheap, GoDaddy 등)에서 DNS 레코드 추가:

**A 레코드 방식**:
```
Type: A
Name: @ (또는 비워둠)
Value: 76.76.21.21
```

**CNAME 방식** (권장):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Apex 도메인** (예: `aiapps.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

#### 도메인 검증

1. DNS 레코드 추가 후 10-60분 대기
2. Vercel Dashboard에서 "Verify" 클릭
3. HTTPS 인증서 자동 발급 (약 5분 소요)

### 3. 서브도메인 설정

여러 서브도메인 사용 (예: `api.aiapps.com`, `admin.aiapps.com`):

```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

---

## 배포 후 검증

### 1. 기본 기능 테스트

배포 후 다음 항목을 확인하세요:

#### 페이지 로드 테스트

- [ ] 홈 페이지 (`/`) 정상 로드
- [ ] 오디오 생성기 (`/apps/audio-generator`) 정상 로드
- [ ] 아트 생성기 (`/apps/art-generator`) 정상 로드
- [ ] 미디어 라이브러리 (`/library`) 정상 로드
- [ ] 설정 페이지 (`/settings`) 정상 로드

#### API 엔드포인트 테스트

**참고**: API는 클라이언트에서 직접 호출되며, 사용자가 `/settings`에서 입력한 API 키를 사용합니다.

서버 측에서 직접 테스트하려면:

```bash
# API 상태 확인 (GET 요청)
curl https://your-domain.vercel.app/api/audio/generate

curl https://your-domain.vercel.app/api/art/generate
```

**실제 오디오/아트 생성 테스트**:

1. 브라우저에서 `/settings` 페이지 접속
2. Gemini API 키 입력 및 저장
3. `/apps/audio-generator` 또는 `/apps/art-generator` 페이지에서 생성 테스트
4. 브라우저 DevTools → Network 탭에서 API 호출 확인

#### 환경 변수 확인

브라우저 콘솔에서:

```javascript
// NEXT_PUBLIC_ 변수 확인
console.log(process.env.NEXT_PUBLIC_APP_URL);
```

#### localStorage API 키 확인

브라우저 콘솔에서:

```javascript
// 암호화된 API 키 확인 (복호화 전)
console.log(localStorage.getItem('gemini_api_key_encrypted'));

// 디바이스 지문 확인
console.log(localStorage.getItem('device_fingerprint'));
```

**주의**: API 키는 AES-256-GCM으로 암호화되어 저장되며, 디바이스 지문 없이는 복호화할 수 없습니다.

### 2. 성능 검증

#### Lighthouse 테스트

1. Chrome DevTools 열기 (`F12`)
2. "Lighthouse" 탭 선택
3. 카테고리 선택:
   - ☑ Performance
   - ☑ Accessibility
   - ☑ Best Practices
   - ☑ SEO
4. "Analyze page load" 클릭

**목표 점수**:
- Performance: 90+ (모바일), 95+ (데스크톱)
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

#### PageSpeed Insights

https://pagespeed.web.dev/ 에서 도메인 입력:

```
https://your-domain.vercel.app
```

**Core Web Vitals 목표**:
- LCP: < 2.5초 (Good)
- FID/INP: < 200ms (Good)
- CLS: < 0.1 (Good)

### 3. 보안 검증

#### Security Headers 확인

```bash
curl -I https://your-domain.vercel.app
```

다음 헤더 확인:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: ...`
- `Strict-Transport-Security: max-age=31536000`

#### SSL/TLS 검증

https://www.ssllabs.com/ssltest/ 에서 도메인 검증:

**목표 등급**: A+

### 4. 관측성 도구 확인

#### Speed Insights 데이터 수집 확인

1. Vercel Dashboard → Speed Insights
2. 최소 100 페이지뷰 발생 후 데이터 확인
3. Core Web Vitals 점수 확인

#### Analytics 이벤트 확인

1. Vercel Dashboard → Analytics
2. 실시간 페이지뷰 확인
3. 탑 페이지 및 리퍼러 데이터 확인

#### Server-Timing 확인

브라우저 DevTools → Network → API 요청 → Timing 탭:
- `total` 메트릭이 표시되는지 확인
- 각 단계별 시간 측정 확인

---

## 트러블슈팅

### 일반적인 문제

#### 1. 빌드 실패

**증상**: 배포 중 빌드 에러 발생

**원인 및 해결**:

```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build

# TypeScript 에러 확인
npm run type-check

# ESLint 에러 확인
npm run lint
```

**Vercel 로그 확인**:
1. Vercel Dashboard → Deployments → 실패한 배포 클릭
2. "Build Logs" 확인
3. 에러 메시지 분석

**흔한 에러**:
- `Module not found`: 의존성 누락 → `package.json` 확인
- `Type error`: TypeScript 에러 → `npm run type-check`로 수정
- `Out of memory`: 빌드 메모리 부족 → Vercel 플랜 업그레이드

#### 2. API 키 인식 안 됨

**증상**: 오디오/아트 생성 시 "API key not found" 또는 "Invalid API key" 에러

**원인**:

- 사용자가 Settings 페이지에서 API 키를 입력하지 않음
- localStorage가 비워짐 (시크릿 모드, 쿠키 삭제 등)
- 다른 디바이스에서 접속

**해결**:

1. **API 키 재입력**
   - `/settings` 페이지 접속
   - "API Key Settings" 섹션에서 Gemini API 키 다시 입력
   - "Save" 버튼 클릭

2. **localStorage 확인**

   브라우저 콘솔에서:

   ```javascript
   // API 키가 저장되어 있는지 확인
   console.log(localStorage.getItem('gemini_api_key_encrypted'));

   // null이면 API 키가 저장되지 않은 것
   ```

3. **API 키 유효성 검증**
   - Settings 페이지에서 "Validate" 버튼 클릭
   - Google AI Studio에서 API 키가 활성화되어 있는지 확인
   - API 키 할당량이 소진되지 않았는지 확인

4. **시크릿 모드 문제**
   - 시크릿 모드에서는 localStorage가 세션 종료 시 삭제됨
   - 일반 브라우저 창에서 사용 권장

#### 3. 이미지 최적화 오류

**증상**: 이미지 로드 실패 또는 최적화 에러

**해결**:

`next.config.ts` 확인:

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // 외부 이미지 도메인 허용 (필요 시)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.example.com',
      },
    ],
  },
};
```

#### 4. API 응답 시간 초과

**증상**: 504 Gateway Timeout 에러

**원인**:
- Gemini API 응답 지연
- API 함수 실행 시간 초과 (Free: 10초, Pro: 60초)

**해결**:

1. **Function 실행 시간 늘리기** (`vercel.json`):
   ```json
   {
     "functions": {
       "app/api/**/*.ts": {
         "maxDuration": 60
       }
     }
   }
   ```

2. **Pro 플랜 업그레이드**:
   - Free: 10초 → Pro: 60초

3. **타임아웃 처리 추가**:
   ```typescript
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 50000); // 50초

   try {
     const result = await fetch(url, { signal: controller.signal });
   } finally {
     clearTimeout(timeout);
   }
   ```

#### 5. Speed Insights 데이터 안 보임

**증상**: Vercel Dashboard에서 Speed Insights 데이터가 표시되지 않음

**해결**:

1. **SpeedInsights 컴포넌트 확인**
   ```typescript
   // app/layout.tsx
   import { SpeedInsights } from '@vercel/speed-insights/next';

   <SpeedInsights />
   ```

2. **최소 트래픽 대기**
   - 최소 100 페이지뷰 필요
   - 실제 사용자 방문 필요 (봇 트래픽 제외)

3. **데이터 수집 시간**
   - 실시간이 아님 (약 1-2시간 지연)
   - 24시간 후 정확한 데이터 확인 가능

4. **Ad Blocker 확인**
   - 일부 광고 차단기가 Analytics 스크립트 차단
   - 시크릿 모드에서 테스트

#### 6. CORS 에러

**증상**: 외부 도메인에서 API 호출 시 CORS 에러

**해결**:

`middleware.ts` 확인 및 수정:

```typescript
export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  // 허용된 오리진 목록
  const allowedOrigins = [
    'https://your-domain.vercel.app',
    'https://www.your-domain.com',
  ];

  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  }

  return response;
}
```

### 성능 최적화 팁

#### 1. 번들 크기 줄이기

```bash
# 번들 분석
npm run analyze

# 큰 의존성 찾기
npx next-bundle-analyzer
```

**최적화 방법**:
- 사용하지 않는 패키지 제거
- Dynamic import 사용
- Tree shaking 활용

```typescript
// ❌ 전체 라이브러리 import
import _ from 'lodash';

// ✅ 필요한 함수만 import
import debounce from 'lodash/debounce';
```

#### 2. 이미지 최적화

```typescript
// Next.js Image 컴포넌트 사용
import Image from 'next/image';

<Image
  src="/hero.png"
  width={1200}
  height={600}
  alt="Hero"
  priority // LCP 개선
  placeholder="blur" // 블러 효과
/>
```

#### 3. 폰트 최적화

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // FOUT 방지
  variable: '--font-inter',
});
```

### 지원 및 문서

- **Vercel 공식 문서**: https://vercel.com/docs
- **Next.js 배포 가이드**: https://nextjs.org/docs/deployment
- **Vercel 지원**: https://vercel.com/support
- **프로젝트 GitHub**: https://github.com/devlikebear/aiapps

---

## 체크리스트

배포 전 최종 확인:

- [ ] 로컬에서 프로덕션 빌드 성공 (`npm run build`)
- [ ] TypeScript 에러 없음 (`npm run type-check`)
- [ ] ESLint 에러 없음 (`npm run lint`)
- [ ] 환경 변수 설정 완료 (`NEXT_PUBLIC_APP_URL`)
- [ ] `.env.local` 파일이 `.gitignore`에 포함됨
- [ ] Vercel 프로젝트 생성 완료
- [ ] GitHub 저장소 연결 완료
- [ ] 첫 배포 성공 확인
- [ ] Speed Insights 활성화 확인
- [ ] Analytics 활성화 확인
- [ ] Settings 페이지에서 Gemini API 키 입력 및 저장
- [ ] 오디오 생성 테스트 완료
- [ ] 아트 생성 테스트 완료
- [ ] Core Web Vitals 점수 확인
- [ ] 보안 헤더 확인
- [ ] SSL 인증서 발급 확인
- [ ] 도메인 연결 (선택 사항)

배포 후:

- [ ] Lighthouse 점수 90+ 달성
- [ ] PageSpeed Insights Green 등급
- [ ] Speed Insights 데이터 수집 확인
- [ ] Server-Timing 헤더 동작 확인
- [ ] 에러 로깅 정상 작동 확인
- [ ] 사용자 피드백 수집 시작

---

## 다음 단계

배포 완료 후:

1. **모니터링 설정**
   - Vercel Dashboard에서 일일 지표 확인
   - 성능 저하 알림 설정 (Pro 플랜)
   - 에러율 추적

2. **지속적 개선**
   - Core Web Vitals 목표치 달성
   - 번들 크기 최적화
   - API 응답 시간 개선

3. **사용자 피드백**
   - Analytics 데이터 분석
   - 사용자 행동 패턴 파악
   - A/B 테스팅 (Pro 플랜)

4. **보안 강화**
   - API 키 로테이션 주기 설정
   - Rate Limiting 모니터링
   - 보안 취약점 정기 점검
