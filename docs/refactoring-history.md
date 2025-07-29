# 리팩토링 작업 내역

## 1. 전역 상태 및 상수 정리 (이전 작업)

- 전역 변수들의 var → let/const 변환
- 매직 넘버를 상수로 추출
- 변수명 개선으로 의미 명확화

## 2. main() 함수 분리 (이전 작업)

- DOM 생성 함수들 분리
  - createHeader()
  - createProductSelector()
  - initializeCartDisplay()
  - createOrderSummary()
  - createManualOverlay()
- 타이머 함수들 분리
  - startLightningSaleTimer()
  - startRecommendationTimer()
- 초기화 로직을 initializeApp()으로 통합

## 3. 이벤트 핸들러 분리 (오늘 작업)

### 3.1 장바구니 클릭 이벤트 핸들러 분리

- handleCartItemClick(): 메인 클릭 이벤트 처리
- handleQuantityChange(): 수량 변경 로직
- handleRemoveItem(): 상품 제거 로직

### 3.2 재고 부족 알림 로직 추가

- 재고 5개 미만 시 콘솔 경고 메시지
- 재고 2개 이하 시 추가 경고 메시지

## 4. React + TypeScript 전환 전 고려사항

### 4.1 상태 관리 중앙화

현재 문제점:

- 전역 변수로 관리되는 상태들 (stockStatusDisplay, itemCount, totalAmount 등)
- DOM 요소를 직접 참조하는 변수들 (productSelectElement, cartItemsContainer 등)

개선 방향:

```typescript
interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  lastSelectedProduct: string | null;
}

interface ProductState {
  products: Product[];
  stockStatus: StockStatus;
}
```

### 4.2 컴포넌트 구조 설계

현재 DOM 생성 함수들의 React 컴포넌트화:

```typescript
// 현재: function createHeader() { ... }
// 변경: function Header() { ... }

// 현재: function createProductSelector() { ... }
// 변경: function ProductSelector({ onSelect }: ProductSelectorProps) { ... }

// 현재: function createOrderSummary() { ... }
// 변경: function OrderSummary({ items, discounts }: OrderSummaryProps) { ... }
```

### 4.3 이벤트 핸들링 개선

현재 문제점:

- DOM 이벤트에 직접 의존
- 이벤트 위임 사용 (cartItemsContainer의 click 이벤트)
- dataset 속성을 통한 데이터 전달

개선 방향:

```typescript
// 현재: cartItemsContainer.addEventListener('click', handleCartItemClick);
// 변경: <CartItem onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
```

### 4.4 비즈니스 로직 분리

현재 문제점:

- UI 로직과 비즈니스 로직이 혼재
- DOM 조작과 상태 업데이트가 결합

분리 대상:

1. 할인 계산 로직

   ```typescript
   class DiscountService {
     calculateIndividualDiscount(product: Product, quantity: number): number;
     calculateBulkDiscount(totalQuantity: number): number;
     calculateTuesdayDiscount(amount: number): number;
   }
   ```

2. 포인트 계산 로직

   ```typescript
   class LoyaltyPointService {
     calculatePoints(purchase: Purchase): PointCalculation;
   }
   ```

3. 재고 관리 로직
   ```typescript
   class InventoryService {
     checkStock(productId: string): StockStatus;
     updateStock(productId: string, quantity: number): void;
   }
   ```

### 4.5 타이머 로직 개선

현재 문제점:

- setInterval과 setTimeout의 직접 사용
- 랜덤 값 사용으로 테스트 어려움
- 컴포넌트 언마운트 시 정리되지 않는 타이머

개선 방향:

```typescript
function useSaleTimer(config: TimerConfig) {
  useEffect(() => {
    const timer = startTimer();
    return () => clearTimer(timer);
  }, [config]);
}
```

### 4.6 타입 정의

필요한 타입 정의:

```typescript
interface Product {
  id: string;
  name: string;
  val: number;
  originalVal: number;
  q: number;
  onSale: boolean;
  suggestSale: boolean;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface Discount {
  type: 'individual' | 'bulk' | 'tuesday' | 'flash' | 'recommendation';
  rate: number;
  conditions: DiscountConditions;
}

interface LoyaltyPoints {
  base: number;
  bonuses: PointBonus[];
  total: number;
}
```

## 5. 남은 작업 우선순위

### 5.1 높은 우선순위

- 타이머 관련 버그 수정
- 재고 복구 버그 수정

### 5.2 중간 우선순위

- 성능 최적화
- 에러 처리 강화

### 5.3 낮은 우선순위

- UI/UX 개선

## 6. 테스트 현황

- 총 테스트 케이스: 103개
- 통과: 87개
- 스킵: 16개 (타이머 관련 13개, 재고 복구 관련 3개)
