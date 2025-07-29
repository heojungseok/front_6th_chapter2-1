# 리팩토링 작업 내역

## 1. 전역 상태 및 상수 정리

- 매직 넘버를 의미 있는 상수로 추출
  - `DISCOUNT_RATES`: 할인율 관련 상수
  - `POINTS_CONFIG`: 포인트 적립 관련 상수
  - `TIMING_CONFIG`: 타이머 관련 상수
  - `STOCK_WARNING_THRESHOLD`: 재고 부족 경고 기준
  - `LOW_STOCK_THRESHOLD`: 낮은 재고 기준

## 2. 변수명 개선

- 모호한 변수명을 명확하고 의미있게 변경
  - `val` → `price` (가격)
  - `originalVal` → `originalPrice` (원래 가격)
  - `q` → `stockQuantity` (재고 수량)
  - `onSale` → `isFlashSale` (번개세일 여부)
  - `suggestSale` → `isRecommended` (추천 상품 여부)
  - `lastSel` → `lastSelectedProductId` (마지막 선택 상품 ID)
  - `prodList` → `productList` (상품 목록)
  - `sum` → `cartTotalDisplay` (장바구니 총액 표시 DOM)

## 3. 함수명 개선

- 함수의 역할을 더 명확하게 표현하는 이름으로 변경
  - `handleAddToCart` → `insertProductToCart` (장바구니에 상품 추가)
  - `handleCalculateCartStuff` → `updateCartCalculations` (장바구니 계산 업데이트)

## 4. 코드 구조 개선

### 4.1 할인 아이콘 로직 개선

```javascript
const discountIcon = `${product.isFlashSale ? '⚡' : ''}${product.isRecommended ? '💝' : ''}`;
```

- 복잡한 삼항 연산자를 템플릿 리터럴로 단순화
- 조건부 아이콘 표시 로직 개선

### 4.2 가격 표시 로직 분리

```javascript
function getPriceDisplay(product) {
  if (!product.isFlashSale && !product.isRecommended) {
    return formatPrice(product.price);
  }
  const priceClass =
    product.isFlashSale && product.isRecommended
      ? 'text-purple-600'
      : product.isFlashSale
        ? 'text-red-500'
        : 'text-blue-500';
  return `
    <span class="line-through text-gray-400">${formatPrice(product.originalPrice)}</span>
    <span class="${priceClass}">${formatPrice(product.price)}</span>
  `;
}
```

- 가격 표시 로직을 별도 함수로 분리
- 할인 가격 표시 스타일 통합

  4.3 재고 부족 알림 로직 추가

```javascript
if (product && product.stockQuantity < STOCK_WARNING_THRESHOLD) {
  console.warn(
    `⚠️ ${product.name}의 재고가 부족합니다. (${product.stockQuantity}개 남음)`
  );
  if (product.stockQuantity <= 2) {
    console.log(`🚨 ${product.name}의 재고가 거의 소진되었습니다!`);
  }
}
```

- 재고 부족 시 경고 메시지 표시
- 심각한 재고 부족 시 추가 알림

## 5. 다음 단계 계획

### 5.1 우선순위가 높은 작업

- 타이머 관련 버그 수정 (lightning sale, recommendation)
- 재고 복구 버그 수정 (장바구니에서 아이템 제거 시)
- 이벤트 핸들러 정리 (handleCartItemClick, handleQuantityChange, handleRemoveItem)

### 5.2 중기 작업

- DOM 조작 로직 추가 분리
- 불필요한 리렌더링 최적화
- 에러 처리 강화

### 5.3 장기 작업

- React + TypeScript 전환 준비
- UI/UX 개선 (로딩 상태, 애니메이션 등)
- 테스트 커버리지 향상

## 6. 코드 분석 및 개선 필요 사항

### 6.1 데이터 모델 분리 필요

- 상수와 상품 데이터가 main.basic.js에 직접 포함됨
- 분리 대상:
  ```javascript
  // productData.js로 분리 필요
  const PRODUCT_CONSTANTS = { ... }
  const DISCOUNT_RATES = { ... }
  const POINTS_CONFIG = { ... }
  const TIMING_CONFIG = { ... }
  const productList = [ ... ]
  ```

### 6.2 DOM 조작 최적화 필요

- innerHTML 사용으로 인한 불필요한 리렌더링 발생

  ```javascript
  // 현재
  summaryDetails.innerHTML += `...`;

  // 개선 방향
  const div = document.createElement('div');
  div.textContent = '...';
  summaryDetails.appendChild(div);
  ```

### 6.3 타이머 로직 개선 필요

- 랜덤 값 사용으로 테스트가 어려움
- 타이머 정리(cleanup) 로직 부재
- 개선 필요한 함수들:
  - startLightningSaleTimer()
  - startRecommendationTimer()

### 6.4 이벤트 핸들링 개선 필요

- 이벤트 위임 패턴 사용 중이나 타입 체크가 불안정
- dataset 속성을 통한 데이터 전달이 불안정
- 개선 대상:
  - handleCartItemClick
  - handleQuantityChange
  - handleRemoveItem

### 6.5 상태 관리 개선 필요

현재 전역 상태:

```javascript
let stockStatusDisplay;
let itemCount;
let productSelectElement;
let totalAmount = 0;
let cartItemsContainer;
let cartTotalDisplay;
let lastSelectedProductId = null;
```

- 전역 변수 사용으로 인한 사이드 이펙트 위험
- DOM 요소 직접 참조로 인한 결합도 증가

### 6.6 HTML 템플릿 관리

- 템플릿 문자열이 함수 내부에 직접 포함됨
- 재사용성과 유지보수성 저하
- 분리 대상:
  - createHeader
  - createProductSelector
  - createOrderSummary
  - createCartItem

## 7. 우선순위별 개선 계획

### 7.1 높은 우선순위

1. 데이터 모델 분리 (상수, 상품 데이터)
2. 타이머 로직 개선
3. 전역 상태 관리 개선

### 7.2 중간 우선순위

1. DOM 조작 최적화
2. 이벤트 핸들링 개선
3. HTML 템플릿 분리

### 7.3 낮은 우선순위

1. 테스트 커버리지 향상
2. 성능 최적화
3. 에러 처리 강화
