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