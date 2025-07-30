# 2025-07-31 Advanced React + TypeScript 설정 및 초기 구조

## 설치된 패키지

### **React 관련**
- `react@19.1.1` - React 라이브러리
- `react-dom@19.1.1` - React DOM 렌더링
- `@types/react@19.1.9` - React TypeScript 타입 정의
- `@types/react-dom@19.1.7` - React DOM TypeScript 타입 정의

### **개발 도구**
- `@vitejs/plugin-react@4.7.0` - Vite React 플러그인
- `typescript@5.4.0` - TypeScript (이미 설치됨)

## 생성된 설정 파일

### **TypeScript 설정**
- **tsconfig.json**: 메인 TypeScript 컴파일러 설정
  - React JSX 지원 (`"jsx": "react-jsx"`)
  - 엄격한 타입 체크 (`"strict": true`)
  - 경로 매핑 (`"@/*": ["src/*"]`)
- **tsconfig.node.json**: Node.js 환경 TypeScript 설정

### **Vite 설정**
- **vite.config.js**: React 플러그인 추가
  ```javascript
  import react from '@vitejs/plugin-react';
  export default defineConfig({
    plugins: [react()],
    // ... 기존 설정 유지
  })
  ```

## 생성된 TypeScript 파일

### **타입 정의**
- **src/advanced/types/index.ts**
  ```typescript
  // Product, CartItem, CartSummary, DiscountData, LoyaltyPoints
  // UIState, 이벤트 핸들러 타입 등
  ```

### **상수 정의**
- **src/advanced/constants/index.ts**
  ```typescript
  // UI, 에러 메시지, 할인, 상품, 포인트, 타이머 관련 상수
  // as const로 타입 안전성 확보
  ```

### **데이터 모델**
- **src/advanced/data/productData.ts**
  ```typescript
  // 상품 목록, 검색 함수, 재고 관리 함수
  // TypeScript 인터페이스 기반 데이터 구조
  ```

## 현재 프로젝트 구조

```
src/advanced/
├── types/
│   └── index.ts          # 타입 정의
├── constants/
│   └── index.ts          # 상수 정의
├── data/
│   └── productData.ts    # 상품 데이터
├── __tests__/            # 기존 테스트
├── main.advanced.js      # 기존 JavaScript 파일
└── main.advanced copy.js # 기존 JavaScript 파일
```

## 다음 단계 예정

### **React 컴포넌트 생성**
- `src/advanced/components/` 디렉토리 생성
- UI 컴포넌트들을 React 컴포넌트로 변환

### **React 훅 생성**
- `src/advanced/hooks/` 디렉토리 생성
- 상태 관리 로직을 React 훅으로 변환

### **서비스 레이어**
- `src/advanced/services/` 디렉토리 생성
- 비즈니스 로직을 TypeScript 서비스로 변환

### **메인 앱**
- `src/advanced/App.tsx` 생성
- 전체 앱을 React 컴포넌트로 구성

## 학습 목표

1. **React 기본 개념 이해**: 컴포넌트, JSX, 상태, 속성
2. **TypeScript 활용**: 타입 안전성, 인터페이스, 제네릭
3. **클린코드 실습**: React + TypeScript 환경에서의 클린코드 원칙
4. **실무 적용**: 기존 JavaScript 코드를 React로 성공적으로 마이그레이션

## 테스트 결과

- ✅ **Basic 테스트**: 87개 통과, 16개 스킵 (기존과 동일)
- ❌ **Advanced 테스트**: 2개 실패 (기존 문제, 설정과 무관)
- ✅ **설정 완료**: React + TypeScript 환경 정상 구축

## 하이브리드 개발 완료 (2025-07-31)

### **1단계: 서비스 레이어 생성**
- **discountService.ts**: 할인 계산 로직 (개별, 전체 수량, 화요일, 번개세일, 추천할인)
- **loyaltyService.ts**: 포인트 계산 로직 (기본, 화요일 보너스, 세트 보너스, 수량 보너스)
- **cartService.ts**: 장바구니 관리 로직 (추가, 제거, 수량 변경, 요약 계산)

### **2단계: 기본 App 컴포넌트 확장**
- **상품 선택 기능**: 드롭다운으로 상품 선택
- **장바구니 관리**: 추가, 제거, 수량 변경 기능
- **실시간 계산**: 소계, 할인, 포인트 실시간 계산
- **재고 확인**: 재고 부족 시 알림 기능
- **반응형 UI**: 모바일/데스크톱 대응

### **구현된 기능**
- ✅ **상품 선택**: 드롭다운으로 상품 선택
- ✅ **장바구니 추가**: 선택한 상품을 장바구니에 추가
- ✅ **수량 변경**: +/- 버튼으로 수량 조절
- ✅ **상품 제거**: 삭제 버튼으로 상품 제거
- ✅ **재고 확인**: 재고 부족 시 알림
- ✅ **실시간 계산**: 소계, 할인, 포인트 실시간 계산
- ✅ **반응형 UI**: 모바일/데스크톱 대응

### **빌드 결과**
- ✅ **빌드 성공**: `dist/advanced/` 디렉토리에 파일 생성
- ✅ **번들 크기**: 18.70 kB (gzip: 6.01 kB)
- ✅ **빌드 시간**: 58ms
- ✅ **로컬 미리보기**: http://localhost:4173/ 에서 확인 가능

### **현재 이슈**
- ⚠️ **번개세일 알림 오류**: 번개세일 타이머가 계속 실행되어 알림이 반복 발생
- 🔧 **해결 필요**: 타이머 로직 개선 및 중복 실행 방지

### **타이머 기능 임시 비활성화 (2025-07-31)**
- **번개세일 할인**: 타이머 오류로 인해 임시 비활성화 (calculateFlashSaleDiscount)
- **추천할인**: 타이머 오류로 인해 임시 비활성화 (calculateRecommendationDiscount)
- **TODO**: 타이머 로직 개선 후 활성화 필요
- **영향**: 개별 상품 할인, 전체 수량 할인, 화요일 할인은 정상 작동

## 빌드 및 배포 명령어

### **로컬 빌드 및 테스트**
```bash
# React + TypeScript 앱 빌드
pnpm build:advanced

# 로컬에서 미리보기
pnpm preview:advanced

# 개발 서버 실행
pnpm start:advanced
```

### **GitHub Pages 배포**
```bash
# 1. 변경사항 커밋
git add .
git commit -m "feat: 하이브리드 개발 완료 - 서비스 레이어 및 기본 App 컴포넌트"

# 2. GitHub에 푸시 (자동 배포 트리거)
git push origin main

# 3. GitHub Actions에서 배포 진행 확인
# GitHub 저장소 → Actions 탭에서 진행 상황 확인
```

### **배포 확인**
- **배포 URL**: `https://[username].github.io/front_6th_chapter2-1/`
- **배포 시간**: 푸시 후 약 2-3분 소요
- **배포 상태**: GitHub 저장소 → Settings → Pages에서 확인 