// 타이머 관리 모듈 import
import {
  startLightningSaleTimer,
  startRecommendationTimer,
  stopAllTimers,
} from './modules/promotion/promotionScheduler.js';

// Product data and constants import
import {
  PRODUCT_CONSTANTS,
  DISCOUNT_RATES,
  POINTS_CONFIG,
  TIMING_CONFIG,
  STOCK_WARNING_THRESHOLD,
  LOW_STOCK_THRESHOLD,
  productList,
  findProductById,
  getTotalStock,
  getLowStockProducts,
  getOutOfStockProducts,
} from './modules/data/productData.js';

// Discount service import
import {
  calculateIndividualDiscount,
  calculateBulkDiscount,
  calculateTuesdayDiscount,
  calculateDiscounts,
  isTuesday,
} from './modules/services/discountService.js';

// Loyalty service import
import { calculateLoyaltyPoints } from './modules/services/loyaltyService.js';

// Cart state management import
import {
  getStockStatusDisplay,
  setStockStatusDisplay,
  getItemCount,
  setItemCount,
  getProductSelectElement,
  setProductSelectElement,
  getTotalAmount,
  setTotalAmount,
  getCartItemsContainer,
  setCartItemsContainer,
  getCartTotalDisplay,
  setCartTotalDisplay,
  getLastSelectedProductId,
  setLastSelectedProductId,
  calculateCartItems,
  updateExistingCartItem,
  handleQuantityChange,
  handleRemoveItem,
  initializeCartState,
} from './modules/cart/cartState.js';

// UI Renderer import
import {
  Header,
  ProductSelector,
  CartDisplay,
  OrderSummary,
  ManualOverlay,
  CartItem,
} from './modules/ui/uiRenderer.js';

// 중복 코드 제거를 위한 헬퍼 함수들
function getRequiredElement(
  getterFunction,
  errorMessage = 'Required element not found'
) {
  const element = getterFunction();
  if (!element) {
    console.warn(errorMessage);
    return null;
  }
  return element;
}

function getRequiredProduct(productId, errorMessage = 'Product not found') {
  const product = findProductById(productId);
  if (!product) {
    console.warn(errorMessage);
    return null;
  }
  return product;
}

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

function getDiscountIcon(product) {
  return `${product.isFlashSale ? '⚡' : ''}${product.isRecommended ? '💝' : ''}`;
}

function getDiscountClassName(product) {
  if (product.isFlashSale && product.isRecommended) {
    return 'text-purple-600 font-bold';
  } else if (product.isFlashSale) {
    return 'text-red-500 font-bold';
  } else if (product.isRecommended) {
    return 'text-blue-500 font-bold';
  }
  return '';
}

function formatPrice(price) {
  return '₩' + price.toLocaleString();
}

function createProductOption(product) {
  const option = document.createElement('option');
  option.value = product.id;

  const discountText =
    getDiscountIcon(product) +
    (product.isFlashSale ? 'SALE' : '') +
    (product.isRecommended ? '추천' : '');

  if (product.stockQuantity === 0) {
    option.textContent = `${product.name} - ${product.price}원 (품절)${discountText}`;
    option.disabled = true;
    option.className = 'text-gray-400';
  } else {
    const discountIcon = getDiscountIcon(product);
    const className = getDiscountClassName(product);

    if (product.isFlashSale || product.isRecommended) {
      const discountPercent =
        product.isFlashSale && product.isRecommended
          ? 25
          : product.isFlashSale
            ? 20
            : 5;
      const discountLabel =
        product.isFlashSale && product.isRecommended
          ? 'SUPER SALE!'
          : product.isFlashSale
            ? 'SALE!'
            : '추천할인!';
      option.textContent = `${discountIcon}${product.name} - ${product.originalPrice}원 → ${product.price}원 (${discountPercent}% ${discountLabel})`;
      option.className = className;
    } else {
      option.textContent = `${product.name} - ${product.price}원${discountText}`;
    }
  }

  return option;
}

function updateSelectOptions() {
  const productSelectElement = getRequiredElement(
    getProductSelectElement,
    'Product select element not found'
  );
  if (!productSelectElement) return 0;

  productSelectElement.innerHTML = '';
  const totalStock = getTotalStock();

  productList.forEach((product) => {
    const option = createProductOption(product);
    productSelectElement.appendChild(option);
  });

  if (totalStock < LOW_STOCK_THRESHOLD) {
    productSelectElement.style.borderColor = 'orange';
  } else {
    productSelectElement.style.borderColor = '';
  }

  return totalStock;
}

function updateStockInfo() {
  const stockStatusDisplay = getRequiredElement(
    getStockStatusDisplay,
    'Stock status display not found'
  );
  if (!stockStatusDisplay) return;

  const lowStockItems = getLowStockProducts();
  const outOfStockItems = getOutOfStockProducts();

  let stockMessage = '';

  lowStockItems.forEach((item) => {
    stockMessage += `${item.name}: 재고 부족 (${item.stockQuantity}개 남음)\n`;
  });

  outOfStockItems.forEach((item) => {
    stockMessage += `${item.name}: 품절\n`;
  });

  stockStatusDisplay.textContent = stockMessage;
}

function updatePricesInCart() {
  const cartItemsContainer = getRequiredElement(
    getCartItemsContainer,
    'Cart items container not found'
  );
  if (!cartItemsContainer) return;

  const cartItems = cartItemsContainer.children;

  for (let i = 0; i < cartItems.length; i++) {
    const itemElement = cartItems[i];
    const product = getRequiredProduct(
      itemElement.id,
      `Product with id ${itemElement.id} not found`
    );

    if (product) {
      updateCartItemDisplay(itemElement, product);
    }
  }

  updateCartCalculations();
}

function updateCartItemDisplay(itemElement, product) {
  const priceDiv = itemElement.querySelector('.text-lg');
  const nameDiv = itemElement.querySelector('h3');

  if (priceDiv) {
    updatePriceDisplay(priceDiv, product);
  }

  if (nameDiv) {
    nameDiv.textContent = getDiscountIcon(product) + product.name;
  }
}

function updatePriceDisplay(priceDiv, product) {
  // 기존 내용 제거
  priceDiv.innerHTML = '';

  if (!product.isFlashSale && !product.isRecommended) {
    const priceSpan = document.createElement('span');
    priceSpan.textContent = formatPrice(product.price);
    priceDiv.appendChild(priceSpan);
    return;
  }

  // 할인가 표시
  const originalPriceSpan = document.createElement('span');
  originalPriceSpan.className = 'line-through text-gray-400';
  originalPriceSpan.textContent = formatPrice(product.originalPrice);

  const currentPriceSpan = document.createElement('span');
  currentPriceSpan.className = getDiscountClassName(product);
  currentPriceSpan.textContent = formatPrice(product.price);

  priceDiv.appendChild(originalPriceSpan);
  priceDiv.appendChild(document.createTextNode(' '));
  priceDiv.appendChild(currentPriceSpan);
}

function updateLoyaltyPointsDisplay(points, pointsDetail) {
  const loyaltyPointsDiv = document.getElementById('loyalty-points');
  if (!loyaltyPointsDiv) return;

  // 기존 내용 제거
  loyaltyPointsDiv.innerHTML = '';

  if (getCartItemsContainer().children.length === 0) {
    loyaltyPointsDiv.style.display = 'none';
    return;
  }

  if (points > 0) {
    const pointsElement = createLoyaltyPointsElement(points, pointsDetail);
    loyaltyPointsDiv.appendChild(pointsElement);
    loyaltyPointsDiv.style.display = 'block';
  } else {
    const zeroPointsElement = createZeroPointsElement();
    loyaltyPointsDiv.appendChild(zeroPointsElement);
    loyaltyPointsDiv.style.display = 'block';
  }
}

function createLoyaltyPointsElement(points, pointsDetail) {
  const container = document.createElement('div');

  const pointsText = document.createElement('div');
  pointsText.innerHTML = `적립 포인트: <span class="font-bold">${points}p</span>`;

  const detailText = document.createElement('div');
  detailText.className = 'text-2xs opacity-70 mt-1';
  detailText.textContent = pointsDetail.join(', ');

  container.appendChild(pointsText);
  container.appendChild(detailText);

  return container;
}

function createZeroPointsElement() {
  const element = document.createElement('div');
  element.textContent = '적립 포인트: 0p';
  return element;
}

function updateItemCountDisplay(count) {
  const itemCountElement = document.getElementById('item-count');
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${count} items in cart`;
  }
}

function updateSummaryDetails(cartItems, subtotal, itemDiscounts) {
  const summaryDetails = document.getElementById('summary-details');
  if (!summaryDetails) return;

  // 기존 내용 제거
  summaryDetails.innerHTML = '';

  if (subtotal <= 0) return;

  // DocumentFragment 사용으로 성능 개선
  const fragment = document.createDocumentFragment();

  // 개별 아이템들 추가
  Array.from(cartItems).forEach((itemElement) => {
    const product = findProductById(itemElement.id);
    if (!product) return;

    const quantity = parseInt(
      itemElement.querySelector('.quantity-number').textContent
    );
    const itemTotal = product.price * quantity;

    const itemRow = createSummaryItemRow(product.name, quantity, itemTotal);
    fragment.appendChild(itemRow);
  });

  // 구분선 추가
  const divider = createDivider();
  fragment.appendChild(divider);

  // 소계 추가
  const subtotalRow = createSummaryRow('Subtotal', formatPrice(subtotal));
  fragment.appendChild(subtotalRow);

  // 할인 정보 추가
  const discountRows = createDiscountRows(itemDiscounts);
  discountRows.forEach((row) => fragment.appendChild(row));

  // 화요일 할인 추가
  if (isTuesday()) {
    const tuesdayRow = createTuesdayDiscountRow();
    fragment.appendChild(tuesdayRow);
  }

  // 배송비 추가
  const shippingRow = createSummaryRow('Shipping', 'Free', 'text-gray-400');
  fragment.appendChild(shippingRow);

  // 한 번에 DOM에 추가
  summaryDetails.appendChild(fragment);
}

// 헬퍼 함수들 - React 컴포넌트로 쉽게 변환 가능
function createSummaryItemRow(productName, quantity, itemTotal) {
  const row = document.createElement('div');
  row.className = 'flex justify-between text-xs tracking-wide text-gray-400';
  row.innerHTML = `
    <span>${productName} x ${quantity}</span>
    <span>${formatPrice(itemTotal)}</span>
  `;
  return row;
}

function createDivider() {
  const divider = document.createElement('div');
  divider.className = 'border-t border-white/10 my-3';
  return divider;
}

function createSummaryRow(label, value, className = '') {
  const row = document.createElement('div');
  row.className = `flex justify-between text-sm tracking-wide ${className}`;
  row.innerHTML = `
    <span>${label}</span>
    <span>${value}</span>
  `;
  return row;
}

function createDiscountRows(itemDiscounts) {
  const rows = [];

  if (getItemCount() >= DISCOUNT_RATES.BULK_PURCHASE_THRESHOLD) {
    const bulkRow = document.createElement('div');
    bulkRow.className =
      'flex justify-between text-sm tracking-wide text-green-400';
    bulkRow.innerHTML = `
      <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
      <span class="text-xs">-${DISCOUNT_RATES.BULK_PURCHASE_DISCOUNT}%</span>
    `;
    rows.push(bulkRow);
  } else if (itemDiscounts.length > 0) {
    itemDiscounts.forEach((item) => {
      const discountRow = document.createElement('div');
      discountRow.className =
        'flex justify-between text-sm tracking-wide text-green-400';
      discountRow.innerHTML = `
        <span class="text-xs">${item.name} (10개↑)</span>
        <span class="text-xs">-${item.discount}%</span>
      `;
      rows.push(discountRow);
    });
  }

  return rows;
}

function createTuesdayDiscountRow() {
  const row = document.createElement('div');
  row.className = 'flex justify-between text-sm tracking-wide text-purple-400';
  row.innerHTML = `
    <span class="text-xs">🌟 화요일 추가 할인</span>
    <span class="text-xs">-${DISCOUNT_RATES.TUESDAY_DISCOUNT}%</span>
  `;
  return row;
}

function updateDiscountInfo(discountRate, totalAmount, originalTotal) {
  const discountInfoDiv = document.getElementById('discount-info');
  if (!discountInfoDiv) return;

  // 기존 내용 제거
  discountInfoDiv.innerHTML = '';

  if (discountRate <= 0 || totalAmount <= 0) return;

  const savedAmount = originalTotal - totalAmount;
  const discountElement = createDiscountInfoElement(discountRate, savedAmount);
  discountInfoDiv.appendChild(discountElement);
}

function createDiscountInfoElement(discountRate, savedAmount) {
  const container = document.createElement('div');
  container.className = 'bg-green-500/20 rounded-lg p-3';

  const headerRow = document.createElement('div');
  headerRow.className = 'flex justify-between items-center mb-1';
  headerRow.innerHTML = `
    <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
    <span class="text-sm font-medium text-green-400">${(discountRate * 100).toFixed(1)}%</span>
  `;

  const savedAmountText = document.createElement('div');
  savedAmountText.className = 'text-2xs text-gray-300';
  savedAmountText.textContent = `${formatPrice(Math.round(savedAmount))} 할인되었습니다`;

  container.appendChild(headerRow);
  container.appendChild(savedAmountText);

  return container;
}

function updateTuesdaySpecialDisplay() {
  const tuesdaySpecial = document.getElementById('tuesday-special');
  const totalAmount = getTotalAmount();
  if (isTuesday() && totalAmount > 0) {
    tuesdaySpecial.classList.remove('hidden');
  } else {
    tuesdaySpecial.classList.add('hidden');
  }
}

// 이벤트 핸들러 함수들
function insertProductToCart() {
  const productSelectElement = getRequiredElement(
    getProductSelectElement,
    'Product select element not found'
  );
  const cartItemsContainer = getRequiredElement(
    getCartItemsContainer,
    'Cart items container not found'
  );
  const cartTotalDisplay = getRequiredElement(
    getCartTotalDisplay,
    'Cart total display not found'
  );

  if (!productSelectElement || !cartItemsContainer || !cartTotalDisplay)
    return null;

  const selectedProduct = getRequiredProduct(
    productSelectElement.value,
    'Selected product not found'
  );
  if (!selectedProduct || selectedProduct.stockQuantity <= 0) return null;

  const existingCartItem = document.getElementById(selectedProduct.id);
  if (existingCartItem) {
    updateExistingCartItem(existingCartItem, selectedProduct);
  } else {
    const cartItemsContainer = getRequiredElement(
      getCartItemsContainer,
      'Cart items container not found'
    );
    if (!cartItemsContainer) return null;

    const cartItemElement = CartItem(selectedProduct);
    cartItemsContainer.appendChild(cartItemElement);
    selectedProduct.stockQuantity--;
  }

  updateCartCalculations();
  setLastSelectedProductId(selectedProduct.id);
}

function handleCartItemClick(event) {
  const targetElement = event.target;

  if (
    !targetElement.classList.contains('quantity-change') &&
    !targetElement.classList.contains('remove-item')
  ) {
    return;
  }

  const productId = targetElement.dataset.productId;
  const product = getRequiredProduct(
    productId,
    `Product with id ${productId} not found`
  );

  if (!product) return;

  if (targetElement.classList.contains('quantity-change')) {
    const changeAmount = parseInt(targetElement.dataset.change);
    handleQuantityChange(productId, changeAmount);
  } else if (targetElement.classList.contains('remove-item')) {
    handleRemoveItem(productId);
  }

  // 재고가 부족한 경우 처리 (현재는 빈 블록이지만 향후 확장 가능)
  if (product && product.stockQuantity < STOCK_WARNING_THRESHOLD) {
    // 재고 부족 알림 로직 추가 가능
    console.warn(
      `⚠️ ${product.name}의 재고가 부족합니다. (${product.stockQuantity}개 남음)`
    );

    // 재고가 매우 적을 때 (2개 이하) 사용자에게 알림
    if (product.stockQuantity <= 2) {
      console.log(`🚨 ${product.name}의 재고가 거의 소진되었습니다!`);
    }
  }

  updateCartCalculations();
  updateSelectOptions();
}

// 타이머 정리 함수 (모듈 함수 래핑)
function cleanupTimers() {
  stopAllTimers();
}

// 초기화 함수
function initializeApp() {
  const rootElement = document.getElementById('app');

  // DOM 요소들 생성 (컴포넌트 사용)
  const header = Header();
  const productSelector = ProductSelector();
  const cartDisplay = CartDisplay();
  const orderSummary = OrderSummary();
  const { manualToggle, manualOverlay } = ManualOverlay();

  // 레이아웃 구성
  const gridContainer = document.createElement('div');
  gridContainer.className =
    'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden';

  const leftColumn = document.createElement('div');
  leftColumn.className = 'bg-white border border-gray-200 p-8 overflow-y-auto';
  leftColumn.appendChild(productSelector);
  leftColumn.appendChild(cartDisplay);

  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(orderSummary);

  // DOM에 추가
  rootElement.appendChild(header);
  rootElement.appendChild(gridContainer);
  rootElement.appendChild(manualToggle);
  rootElement.appendChild(manualOverlay);

  // 초기 상태 설정
  updateSelectOptions();
  updateCartCalculations();

  // 이벤트 리스너 설정
  const addToCartBtn = document.getElementById('add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', insertProductToCart);
  }

  // 타이머 시작 (모듈 함수 사용)
  startLightningSaleTimer(productList, updateSelectOptions, updatePricesInCart);
  startRecommendationTimer(
    productList,
    getLastSelectedProductId,
    updateSelectOptions,
    updatePricesInCart
  );
}

function updateCartCalculations() {
  const cartItemsContainer = getRequiredElement(
    getCartItemsContainer,
    'Cart items container not found'
  );
  const cartTotalDisplay = getRequiredElement(
    getCartTotalDisplay,
    'Cart total display not found'
  );
  if (!cartItemsContainer || !cartTotalDisplay) return null;

  const cartItems = cartItemsContainer.children;

  // Calculate cart items and totals
  const cartData = calculateCartItems(cartItems);
  const { items, subtotal, totalQuantity } = cartData;

  // Calculate discounts
  const discountData = calculateDiscounts(cartData);
  const {
    totalAmount: calculatedTotalAmount,
    itemDiscounts,
    discountRate,
  } = discountData;

  // Update global state
  setTotalAmount(calculatedTotalAmount);
  setItemCount(totalQuantity);

  // Update visual styling for bulk items
  items.forEach(({ product, quantity }) => {
    const itemElement = document.getElementById(product.id);
    if (itemElement) {
      const priceElements = itemElement.querySelectorAll('.text-lg, .text-xs');
      priceElements.forEach((elem) => {
        if (elem.classList.contains('text-lg')) {
          elem.style.fontWeight =
            quantity >= DISCOUNT_RATES.INDIVIDUAL_DISCOUNT_THRESHOLD
              ? 'bold'
              : 'normal';
        }
      });
    }
  });

  // Update UI
  updateItemCountDisplay(totalQuantity);
  updateSummaryDetails(cartItems, subtotal, itemDiscounts);
  updateDiscountInfo(discountRate, calculatedTotalAmount, subtotal);
  updateTuesdaySpecialDisplay();

  // Update total display
  const totalDiv = cartTotalDisplay.querySelector('.text-2xl');
  if (totalDiv) {
    totalDiv.textContent = formatPrice(Math.round(calculatedTotalAmount));
  }

  // Calculate and display loyalty points
  const { finalPoints, pointsDetail } = calculateLoyaltyPoints(
    calculatedTotalAmount,
    totalQuantity,
    Array.from(cartItems)
  );
  updateLoyaltyPointsDisplay(finalPoints, pointsDetail);

  // Update stock information
  updateStockInfo();
}

// 최종 main 함수
function main() {
  // 기존 타이머 정리
  cleanupTimers();

  // 장바구니 상태 초기화
  initializeCartState();
  initializeApp();
  getCartItemsContainer().addEventListener('click', handleCartItemClick);
}

main();
